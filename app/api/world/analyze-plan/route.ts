import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PRO_MODEL = 'gemini-2.0-flash-thinking-exp-01-21';

async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error.message?.includes('429') || error.status === 429) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Quota exceeded (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const { planText, genres } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: PRO_MODEL });
    
    const analysisSchema = {
      type: 'object',
      properties: {
        proposal: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            coreConcept: { type: 'string' },
            protagonistIdea: { type: 'string' },
            firstEpisodeHook: { type: 'string' },
            currentStatus: { type: 'string' },
            unresolvedList: { type: 'string', description: '全巻の構成、チャプター、技術ツール名等を一文字も漏らさず格納' },
            progress: { type: 'string' },
          },
          required: ['title', 'coreConcept', 'protagonistIdea', 'firstEpisodeHook'],
        },
        genreId: { type: 'string' },
      },
      required: ['proposal', 'genreId'],
    };

    const genreOptions = genres.map((g: any) => `- id: "${g.id}", name: "${g.name}"`).join('\n');

    const prompt = `
      あなたは「情報の完全性」を司る編集者です。
      入力された企画案から、あらゆる詳細情報を抽出・継承してください。

      **【抽出の絶対ルール：要約厳禁】**
      1. **情報を絶対に削らない**: 入力された「Vol.1〜Vol.5」の全チャプター、具体的ツール名、手順をすべて \`unresolvedList\` に書き写してください。
      2. **役割の変換**: 実用書や解説本の場合、\`protagonistIdea\` は「悩める読者（生徒）」、\`firstEpisodeHook\` は「解決したい悩み（Pain Point）」として抽出。
      3. **ジャンル選定**: 
         ${genreOptions} から最適なIDを1つ選んでください。

      **入力データ:**
      ${planText}
    `;

    const result = await fetchWithRetry(() =>
      model.generateContent({
        contents: prompt,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: analysisSchema as any,
        },
      } as any)
    );

    const response = await result.response;
    const text = response.text();
    const resultData = JSON.parse(text);

    return NextResponse.json(resultData);
  } catch (error: any) {
    console.error('Error analyzing plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze plan' },
      { status: 500 }
    );
  }
}
