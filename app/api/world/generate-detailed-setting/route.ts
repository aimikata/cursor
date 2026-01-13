import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PRO_MODEL = 'gemini-2.5-flash';

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

    const result: any = await fetchWithRetry(() =>
      model.generateContent({
        contents: prompt,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: detailedSettingSchema as any,
        },
      } as any)
    );

    const response = await result.response;
    let text = response.text().trim();
    
    // デバッグ用：レスポンスの最初の500文字をログに出力
    console.log('API Response (first 500 chars):', text.substring(0, 500));
    
    // JSONの修復処理（バッククォートや余計なテキストを削除）
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // JSONオブジェクトの開始と終了を探す
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      text = text.substring(startIdx, endIdx + 1);
    } else {
      // JSONが見つからない場合、エラーメッセージを返す
      console.error('JSON not found in response. Full response:', text);
      throw new Error(`Invalid response format. Expected JSON but got: ${text.substring(0, 200)}...`);
    }
    
    let detailedSetting;
    try {
      detailedSetting = JSON.parse(text);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError);
      console.error('Text that failed to parse:', text);
      throw new Error(`Failed to parse JSON: ${parseError.message}. Response: ${text.substring(0, 200)}...`);
    }

    return NextResponse.json({ detailedSetting });
  } catch (error: any) {
    console.error('Error generating detailed setting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate detailed setting' },
      { status: 500 }
    );
  }
}
