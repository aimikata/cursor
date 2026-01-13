import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getMasterSheetOnlyPrompt } from '@/app/lib/research/constants';

const FLASH_MODEL = 'gemini-2.0-flash-exp';

export async function POST(req: NextRequest) {
  try {
    const { concept } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
