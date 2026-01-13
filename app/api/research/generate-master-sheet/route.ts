import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMasterSheetOnlyPrompt } from '@/app/lib/research/constants';

const FLASH_MODEL = 'gemini-2.0-flash-exp';

export async function POST(req: NextRequest) {
  try {
    const { concept, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: FLASH_MODEL });
    
    const prompt = getMasterSheetOnlyPrompt(concept);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ masterSheet: text });
  } catch (error: any) {
    console.error('Error generating master sheet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate master sheet' },
      { status: 500 }
    );
  }
}
