
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { getTopicProposalPrompt, getConceptPrompt, getGenreProposalPrompt, getMasterSheetOnlyPrompt } from '../constants';
import { TargetRegion } from '../types';

const FLASH_MODEL = 'gemini-3-flash-preview';
const PRO_MODEL = 'gemini-3-pro-preview';
const THINKING_BUDGET = 16384;

async function callGeminiWithRetry(
  params: any, 
  maxRetries: number = 5
): Promise<GenerateContentResponse> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      return await ai.models.generateContent(params);
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || "";
      const isRateLimit = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
      if (isRateLimit && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 3000 + (Math.random() * 1000);
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
    return text.split("---SECTION_SPLIT---").map(item => item.trim()).filter(item => item.length > 0);
  }
  const itemStartRegex = /(?:^|\n)(?:#{1,3}\s*)?(?:\*{0,2})\d+[\.\:)](?:\*{0,2})\s+/g;
  const matches = [...text.matchAll(itemStartRegex)];
  if (matches.length === 0) {
    const blocks = text.split(/\n\n+/).map(t => t.trim()).filter(t => t.length > 0);
    return blocks.length > 0 ? blocks : [text];
  }
  const items: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const startContentIndex = matches[i].index + matches[i][0].length;
    const nextMatchIndex = i < matches.length - 1 ? matches[i + 1].index : text.length;
    let content = text.substring(startContentIndex, nextMatchIndex).trim();
    if (content.length > 0) items.push(content);
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
    handleApiError(error);
    return [];
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
      const sources = groundingChunks.map((chunk: any) => chunk.web ? `- [${chunk.web.title}](${chunk.web.uri})` : null).filter((s: any) => s !== null);
      if (sources.length > 0) finalText += "\n\n### 参照ソース (Google Search)\n" + sources.join("\n");
    }
    return finalText;
  } catch (error: any) {
    if (error?.message?.includes('429')) {
      try {
        const fallback = await callGeminiWithRetry({ model: FLASH_MODEL, contents: getConceptPrompt(topic, region) });
        return (fallback.text || "") + "\n\n*(注意: 高負荷のため標準モデルで生成されました)*";
      } catch (fError) { handleApiError(fError); }
    }
    handleApiError(error);
    return "";
  }
}

export async function generateMasterSheet(conceptText: string): Promise<string> {
  try {
    const response = await callGeminiWithRetry({ model: FLASH_MODEL, contents: getMasterSheetOnlyPrompt(conceptText) });
    return response.text || "";
  } catch (error: any) { handleApiError(error); return ""; }
}

function handleApiError(error: any) {
  const msg = error?.message || "";
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    throw new Error("Gemini APIの無料枠制限に達しました。1分ほど待ってから「やり直す」をクリックしてください。");
  } else if (msg.includes('API key not valid')) {
    throw new Error("APIキーが無効です。");
  } else {
    throw new Error("AIとの通信中にエラーが発生しました。");
  }
}
