import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

export async function POST(req: NextRequest) {
  try {
    const { planText, genres, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
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
      **【最重要】出力は必ず日本語のみで記述してください（英語の混在・二言語併記は禁止）。**
      **【構成】入力の見出し構造を崩さず、日本語見出しのみで整理して出力してください。**
      入力された企画案から、あらゆる詳細情報を抽出・継承してください。

      **【抽出の絶対ルール：要約厳禁】**
      1. **情報を絶対に削らない**: 入力された「Vol.1〜Vol.5」の全チャプター、具体的ツール名、手順をすべて \`unresolvedList\` に書き写してください。
      2. **役割の変換**: 実用書や解説本の場合、\`protagonistIdea\` は「悩める読者（生徒）」、\`firstEpisodeHook\` は「解決したい悩み（Pain Point）」として抽出。
      3. **ジャンル選定**: 
         ${genreOptions} から最適なIDを1つ選んでください。

      **入力データ:**
      ${planText}
    `;

    let lastError: any;

    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await fetchWithRetry(() =>
          model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: analysisSchema as any,
            },
          } as any)
        );

        const response = await result.response;
        const text = response.text();
        const resultData = JSON.parse(text);

        return NextResponse.json({ ...resultData, usedModel: modelName });
      } catch (error: any) {
        lastError = error;
        console.warn(`Model ${modelName} failed:`, error);
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error('Error analyzing plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze plan' },
      { status: 500 }
    );
  }
}
