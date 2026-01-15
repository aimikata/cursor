import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const IMAGE_MODEL = 'gemini-2.5-flash-image';

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
    const { character, artStylePrompt, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    // 画像生成用のキーを優先的に使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: IMAGE_MODEL });
    
    const designs: string[] = [];
    const imageCount = 1;
    
    for (let i = 0; i < imageCount; i++) {
      const imagePrompt = `
        MASTERPIECE character concept art. 
        STRICTLY ONE CHARISMATIC AND ATTRACTIVE CHARACTER IN THE CENTER. 
        FULL BODY SHOT, SHOWING HEAD TO TOE. FEET AND SHOES MUST BE FULLY VISIBLE. 
        STARK, PURE FLAT WHITE BACKGROUND. 
        ABSOLUTELY NO BACKGROUND ELEMENTS, NO FLOATING OBJECTS, NO UI PANELS, NO GADGETS, NO KEYBOARDS, NO CABLES, NO HEADPHONES. 
        HANDS MUST BE COMPLETELY EMPTY. HOLDING NOTHING AT ALL. 
        HEALTHY, BEAUTIFUL, AND CHARMING FACE. NO DARK CIRCLES, NO TIRED EYES, NO EXHAUSTION.
        THE CHARACTER IS STANDING STRAIGHT IN AN EMPTY SPACE. 
        Clean, high-quality professional manga line art. 
        Physical appearance and clothing: ${character.visualTags}.
        Art Style: ${artStylePrompt}.
      `;
      
      const result = await fetchWithRetry(() =>
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
        } as any)
      , 2);

      const response = await result.response;
      
      // 画像データの取得（Gemini APIの応答形式に応じて調整が必要な場合があります）
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            designs.push(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      }
    }

    return NextResponse.json({ 
      characterName: character.name,
      characterEnglishName: character.englishName,
      fullBodyDesigns: designs 
    });
  } catch (error: any) {
    const message = error?.message || '';
    if (message.includes('Quota exceeded') || message.includes('429')) {
      return NextResponse.json(
        { 
          warning: '画像生成のクォータ上限に達しました。少し待って再試行するか、有料プランのAPIキーをご利用ください。',
          characterName: character?.name,
          characterEnglishName: character?.englishName,
          fullBodyDesigns: []
        },
        { status: 200 }
      );
    }
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
