import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGenreProposalPrompt } from '@/app/lib/research/constants';

const MODELS_TO_TRY = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5'];

// 429エラー対策のリトライ関数（RetryInfoを尊重）
async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 5, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || '';
      const isRateLimit = errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Quota exceeded');
      
      if (isRateLimit && i < maxRetries - 1) {
        // RetryInfoからretryDelayを抽出（"Please retry in 21.229469642s" の形式）
        let delay = initialDelay * Math.pow(2, i);
        const retryMatch = errorMessage.match(/Please retry in ([\d.]+)s/i);
        if (retryMatch) {
          const retrySeconds = parseFloat(retryMatch[1]);
          delay = Math.max(delay, retrySeconds * 1000 + 1000); // 秒をミリ秒に変換し、少し余裕を持たせる
        }
        
        console.warn(`クォータ超過 (429)。${Math.round(delay/1000)}秒後にリトライします... (試行 ${i + 1}/${maxRetries})`);
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
    const startContentIndex = currentMatch.index! + currentMatch[0].length;
    const nextMatchIndex = i < matches.length - 1 ? matches[i + 1].index! : text.length;
    let content = text.substring(startContentIndex, nextMatchIndex).trim();
    content = content.replace(/\n---+\n?$/, '').trim();
    if (content.length > 0) {
      items.push(content);
    }
  }
  return items;
}

export async function POST(req: NextRequest) {
  try {
    const { region, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    const prompt = getGenreProposalPrompt(region);
    let lastError: any;

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await fetchWithRetry(() => model.generateContent(prompt));
        const response = await result.response;
        const text = response.text();

        const genres = parseResponseList(text);

        return NextResponse.json({ genres, usedModel: modelName });
      } catch (error: any) {
        lastError = error;
        console.warn(`Model ${modelName} failed:`, error);
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error('Error generating genres:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate genres' },
      { status: 500 }
    );
  }
}
