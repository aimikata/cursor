import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const IMAGE_MODEL = 'gemini-2.0-flash-exp';

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
    
    for (let i = 0; i < 3; i++) {
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
          contents: imagePrompt,
          generationConfig: {
            responseMimeType: 'image/png',
          },
        } as any)
      );

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
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
