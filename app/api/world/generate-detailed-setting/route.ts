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
    const { proposal, genreId, genres, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: PRO_MODEL });
    
    const selectedGenre = genres.find((g: any) => g.id === genreId);
    if (!selectedGenre) {
      return NextResponse.json(
        { error: 'Genre not found' },
        { status: 400 }
      );
    }

    const detailedSettingSchema = {
      type: 'object',
      properties: {
        seriesTitle: { type: 'string' },
        volumes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              volumeNumber: { type: 'integer' },
              title: { type: 'string' },
              summary: { type: 'string' },
              chapters: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    chapterNumber: { type: 'string' },
                    title: { type: 'string' },
                    estimatedPages: { type: 'string' },
                    sections: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          description: { type: 'string' },
                        },
                        required: ['title', 'description'],
                      },
                    },
                  },
                  required: ['chapterNumber', 'title', 'estimatedPages', 'sections'],
                },
              },
            },
            required: ['volumeNumber', 'title', 'summary', 'chapters'],
          },
        },
        currentStatus: { type: 'string' },
        unresolvedList: { type: 'string' },
        progress: { type: 'string' },
        artStyleTags: { type: 'string' },
        backgroundTags: { type: 'string' },
        worldview: {
          type: 'object',
          properties: {
            coreRule: {
              type: 'object',
              properties: { 
                name: { type: 'string' }, 
                merit: { type: 'string' }, 
                demerit: { type: 'string' } 
              },
              required: ['name', 'merit', 'demerit'],
            },
            keyLocations: {
              type: 'array',
              items: {
                type: 'object',
                properties: { 
                  name: { type: 'string' }, 
                  historicalBackground: { type: 'string' }, 
                  structuralFeatures: { type: 'string' } 
                },
                required: ['name', 'historicalBackground', 'structuralFeatures'],
              },
            },
            organizations: {
              type: 'array',
              items: {
                type: 'object',
                properties: { 
                  name: { type: 'string' }, 
                  purpose: { type: 'string' }, 
                  conflictRelationship: { type: 'string' }, 
                  hierarchySystem: { type: 'string' } 
                },
                required: ['name', 'purpose', 'conflictRelationship', 'hierarchySystem'],
              },
            },
          },
          required: ['coreRule', 'keyLocations', 'organizations'],
        },
        protagonist: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            englishName: { type: 'string' },
            age: { type: 'string' },
            occupation: { type: 'string' },
            publicPersona: { type: 'string' },
            hiddenSelf: { type: 'string' },
            pastTrauma: { type: 'string' },
            greatestWeakness: { type: 'string' },
            potentialWhenOvercome: { type: 'string' },
            visualTags: { type: 'string' },
          },
          required: ['name', 'englishName', 'age', 'occupation', 'publicPersona', 'hiddenSelf', 'pastTrauma', 'greatestWeakness', 'potentialWhenOvercome', 'visualTags'],
        },
        rivals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              englishName: { type: 'string' },
              age: { type: 'string' },
              occupation: { type: 'string' },
              publicPersona: { type: 'string' },
              hiddenSelf: { type: 'string' },
              pastTrauma: { type: 'string' },
              greatestWeakness: { type: 'string' },
              potentialWhenOvercome: { type: 'string' },
              relationshipWithProtagonist: { type: 'string' },
              goal: { type: 'string' },
              secret: { type: 'string' },
              visualTags: { type: 'string' },
            },
            required: ['name', 'englishName', 'age', 'occupation', 'publicPersona', 'hiddenSelf', 'pastTrauma', 'greatestWeakness', 'potentialWhenOvercome', 'relationshipWithProtagonist', 'goal', 'secret', 'visualTags'],
          },
        },
      },
      required: ['seriesTitle', 'volumes', 'currentStatus', 'unresolvedList', 'progress', 'worldview', 'protagonist', 'rivals', 'artStyleTags', 'backgroundTags'],
    };

    const prompt = `
      あなたは「最高峰のコンテンツ・アーキテクト」です。
      
      **【指示：主人公・登場人物の絶対的な魅力】**
      作品の顔となるキャラクターは、読者が「このキャラをもっと見たい」と思える圧倒的な魅力（ビジュアル・性格両面）を持たせてください。
      - **健康的で美しい容姿**: どんな苦境にある設定でも、顔立ちは整い、肌は綺麗で、目は輝いているように描写してください。
      - **ネガティブな外見要素の排除**: 目の下の隈（クマ）、疲弊した死んだ目、不潔感のあるボサボサ髪などは「絶対に」避けてください。
      - **カリスマ性の付与**: 解説本であっても、主人公は「魅力的で憧れられるナビゲーター」として設計してください。

      **【指示：キャラクター名の絶対的多様性】**
      名前が似通ったパターンにならないよう、徹底的に個性を出してください。
      
      **【指示：情報の完全継承】**
      入力された構成案（Vol.1〜5等）の内容はすべて詳細に継承してください。

      **入力データ:**
      ${JSON.stringify(proposal)}
    `;

    const result = await fetchWithRetry(() =>
      model.generateContent({
        contents: prompt,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: detailedSettingSchema as any,
        },
      } as any)
    );

    const response = await result.response;
    const text = response.text();
    const detailedSetting = JSON.parse(text);

    return NextResponse.json({ detailedSetting });
  } catch (error: any) {
    console.error('Error generating detailed setting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate detailed setting' },
      { status: 500 }
    );
  }
}
