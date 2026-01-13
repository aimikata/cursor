import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGenreProposalPrompt } from '@/app/lib/research/constants';

const FLASH_MODEL = 'gemini-2.0-flash-exp';

function parseResponseList(text: string): string[] {
  if (text.includes("---SECTION_SPLIT---")) {
    return text
      .split("---SECTION_SPLIT---")
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  const itemStartRegex = /(?:^|\n)(?:#{1,3}\s*)?(?:\*{0,2})\d+[\.\:)](?:\*{0,2})\s+/g;
  const matches = [...text.matchAll(itemStartRegex)];

  if (matches.length === 0) {
    const blocks = text.split(/\n\n+/).map(t => t.trim()).filter(t => t.length > 0);
    return blocks.length > 0 ? blocks : [text];
  }

  const items: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const startContentIndex = currentMatch.index! + currentMatch[0].length;
    const nextMatchIndex = i < matches.length - 1 ? matches[i + 1].index! : text.length;
    let content = text.substring(startContentIndex, nextMatchIndex).trim();
    content = content.replace(/\n---+\n?$/, '').trim();
    if (content.length > 0) {
      items.push(content);
    }
  }
  return items;
}

export async function POST(req: NextRequest) {
  try {
    const { region, apiKey } = await req.json();
    
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
    
    const prompt = getGenreProposalPrompt(region);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const genres = parseResponseList(text);

    return NextResponse.json({ genres });
  } catch (error: any) {
    console.error('Error generating genres:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate genres' },
      { status: 500 }
    );
  }
}
