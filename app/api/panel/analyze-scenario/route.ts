import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODELS_TO_TRY = ['gemini-2.0-flash-thinking-exp-01-21', 'gemini-2.0-flash-exp'];

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
    const { scenario, worldSettings, mode, toolType } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
          })
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
