import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS_TO_TRY = ['gemini-2.5-flash'];

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
    const { scenario, worldSettings, mode, toolType, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // ジャンルリスト（ツールタイプに応じて変更）
    let genres: string[] = [];
    if (toolType === 'normal') {
      genres = ['AIおまかせ', '恋愛', '学園', 'ビジネス', 'バトル', 'ダークファンタジー', 'ロマンスファンタジー', 'SF', '日常系'];
    } else if (toolType === 'business') {
      genres = ['ビジネス・自己啓発', '企業ドキュメンタリー', '学習・ノウハウ', '伝記・成功譚', '医療・社会派'];
    } else if (toolType === 'youtube') {
      genres = ['ビジネス・自己啓発', '企業ドキュメンタリー', '学習・ノウハウ', '伝記・成功譚', '医療・社会派', 'エンタメ・スカッと系', 'ホラー・ミステリー'];
    }

    const estimationRules = mode === 'explanatory' 
      ? `- **EXPLANATORY/PRACTICAL BOOK**: 
         - DO NOT compress content. 
         - **1 Topic/Concept = 3-4 Pages** (Intro -> Theory -> Diagram -> Example).
         - If the text has Intro, Theory, and Examples, that is at least **8-10 pages**.
         - Minimum suggestion: 8 pages (unless text is extremely short).`
      : `- **STORY MANGA**:
         - 1 page per 150-200 characters of text, or 1 page per major action/beat.
         - If the scenario is short (< 500 chars), suggestion: 4-8 pages.`;

    const prompt = `
You are a professional Manga Editor.
Analyze the following scenario text and world settings.

Task:
1. Determine the most appropriate Genre from this list: ${JSON.stringify(genres)}.
2. Estimate the appropriate Page Count (number of pages) required to draw this scenario as a manga.
   - **Mode: ${mode || 'story'}**

   **Estimation Rules:**
   ${estimationRules}
   - Maximum page count suggestion: 50.

Scenario:
${scenario}

World Settings:
${worldSettings || "None"}
`;

    const responseSchema = {
      type: 'object',
      properties: {
        pageCount: { type: 'integer' },
        genre: { type: 'string' },
      },
      required: ['pageCount', 'genre'],
    };

    let lastError: any;
    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await fetchWithRetry(() =>
          model.generateContent({
            contents: prompt,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: responseSchema as any,
            },
          } as any)
        );

        const response = await result.response;
        const text = response.text();
        
        let resultData;
        try {
          resultData = JSON.parse(text);
        } catch (e) {
          const cleanText = text.replace(/```json|```/g, '').trim();
          resultData = JSON.parse(cleanText);
        }

        // Validate Genre
        let genre = genres[0]; // デフォルト
        if (resultData.genre && genres.includes(resultData.genre)) {
          genre = resultData.genre;
        }

        // Validate Page Count
        let pageCount = 4;
        if (typeof resultData.pageCount === 'number') {
          pageCount = Math.max(1, Math.min(50, resultData.pageCount));
        }

        // Force minimum for explanatory if it seems low but text is present
        if (mode === 'explanatory' && pageCount < 6 && scenario.length > 200) {
          pageCount = 8;
        }

        return NextResponse.json({ pageCount, genre });
      } catch (error: any) {
        console.warn(`Failed with ${modelName}:`, error);
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error('All models failed');
  } catch (error: any) {
    console.error('Error analyzing scenario:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze scenario' },
      { status: 500 }
    );
  }
}
