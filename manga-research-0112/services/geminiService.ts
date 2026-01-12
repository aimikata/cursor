
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { getTopicProposalPrompt, getConceptPrompt, getGenreProposalPrompt, getMasterSheetOnlyPrompt } from '../constants';
import { TargetRegion } from '../types';

/**
 * モデルの使い分け:
 * - 標準タスク (ジャンル・テーマ生成): gemini-3-flash-preview
 * - 複雑なタスク (詳細企画立案): gemini-3-pro-preview
 */
const FLASH_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';
const THINKING_BUDGET = 16384;

let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
}

/**
 * 指数バックオフによるリトライ処理
 * 429エラー時は最大5回、徐々に間隔をあけてリトライします
 */
async function callGeminiWithRetry(
  params: any, 
  maxRetries: number = 5
): Promise<GenerateContentResponse> {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // 常に最新のクライアントを生成（APIキーの反映を確実にするため）
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      return await ai.models.generateContent(params);
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || "";
      const isRateLimit = errorMsg.includes('429') || 
                          errorMsg.includes('RESOURCE_EXHAUSTED') || 
                          error?.status === 'RESOURCE_EXHAUSTED';
      
      if (isRateLimit && attempt < maxRetries - 1) {
        // 1回目: 3s, 2回目: 6s, 3回目: 12s... と待機時間を増やす
        const delay = Math.pow(2, attempt) * 3000 + (Math.random() * 1000);
        console.warn(`Gemini API 429 Detected. Retrying in ${Math.round(delay/1000)}s... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function parseResponseList(text: string): string[] {
  if (text.includes("---SECTION_SPLIT---")) {
    return text
      .split("---SECTION_SPLIT---")
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  const itemStartRegex = /(?:^|\n)(?:#{1,3}\s*)?(?:\*{0,2})\d+[\.\:)](?:\*{0,2})\s+/g;
  const matches = [...text.matchAll(itemStartRegex)];

  if (matches.length === 0) {
    const blocks = text.split(/\n\n+/).map(t => t.trim()).filter(t => t.length > 0);
    return blocks.length > 0 ? blocks : [text];
  }

  const items: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const startContentIndex = currentMatch.index + currentMatch[0].length;
    const nextMatchIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
    let content = text.substring(startContentIndex, nextMatchIndex).trim();
    content = content.replace(/\n---+\n?$/, '').trim();
    if (content.length > 0) {
      items.push(content);
    }
  }
  return items;
}

export async function generateGenres(region: TargetRegion): Promise<string[]> {
  try {
    const prompt = getGenreProposalPrompt(region);
    const response = await callGeminiWithRetry({
      model: FLASH_MODEL,
      contents: prompt,
    });

    return parseResponseList(response.text || "");
  } catch (error: any) {
    console.error("Error in generateGenres:", error);
    handleApiError(error);
    return []; // Never reached due to handleApiError
  }
}

export async function generateTopics(genre: string, keyword: string | undefined, region: TargetRegion): Promise<string[]> {
  try {
    const prompt = getTopicProposalPrompt(genre, keyword, region);
    const response = await callGeminiWithRetry({
        model: FLASH_MODEL,
        contents: prompt,
    });
    
    return parseResponseList(response.text || "");
  } catch (error: any) {
    console.error("Error in generateTopics:", error);
    handleApiError(error);
    return [];
  }
}

export async function generateMangaConcept(topic: string, region: TargetRegion): Promise<string> {
  try {
    const prompt = getConceptPrompt(topic, region);
    
    const response = await callGeminiWithRetry({
        model: PRO_MODEL,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingBudget: THINKING_BUDGET }
        }
    });

    let finalText = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks && groundingChunks.length > 0) {
      const sources = groundingChunks
        .map((chunk: any) => {
          if (chunk.web) return `- [${chunk.web.title}](${chunk.web.uri})`;
          return null;
        })
        .filter((s: string | null) => s !== null);

      if (sources.length > 0) {
        finalText += "\n\n### 参照ソース (Google Search)\n" + sources.join("\n");
      }
    }

    return finalText;
  } catch (error: any) {
    console.error("Error in generateMangaConcept:", error);
    // 429の場合、Flashモデルで代替を試みる
    if (error?.message?.includes('429')) {
      try {
        const fallbackResponse = await callGeminiWithRetry({
          model: FLASH_MODEL,
          contents: getConceptPrompt(topic, region),
        });
        return (fallbackResponse.text || "") + "\n\n*(注意: 高負荷のため標準モデルで生成されました)*";
      } catch (fallbackError) {
        handleApiError(fallbackError);
      }
    }
    handleApiError(error);
    return "";
  }
}

export async function generateMasterSheet(conceptText: string): Promise<string> {
  try {
    const prompt = getMasterSheetOnlyPrompt(conceptText);
    const response = await callGeminiWithRetry({
        model: FLASH_MODEL,
        contents: prompt,
    });
    return response.text || "";
  } catch (error: any) {
    console.error("Error in generateMasterSheet:", error);
    handleApiError(error);
    return "";
  }
}

/**
 * 共通のエラーハンドリング
 */
function handleApiError(error: any) {
  const msg = error?.message || "";
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    throw new Error("Gemini APIの無料枠制限（1分間あたりの回数制限）に達しました。1分ほど待ってから「やり直す」か、ブラウザを更新してください。もし解決しない場合はAPIキーの利用枠が終了している可能性があります。");
  } else if (msg.includes('API key not valid')) {
    throw new Error("APIキーが無効です。設定を確認してください。");
  } else {
    throw new Error("AIとの通信中にエラーが発生しました。時間を置いて再度お試しください。");
  }
}
