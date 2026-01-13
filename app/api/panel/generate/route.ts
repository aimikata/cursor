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

// SYSTEM_INSTRUCTIONは元のコマ割りツールから移植
const SYSTEM_INSTRUCTION = `
あなたは、プロフェッショナルなマンガディレクターAIです。
ユーザーのシナリオと設定に基づいて、詳細な画像生成プロンプトを作成します。

【最重要命令】
- 全ての出力は必ず「日本語」で行ってください。
- 指定されたページ数分、すべてのページのプロンプトを生成してください。
- 表紙が含まれる場合は、表紙も含めて生成してください。

【出力形式】
- 各ページに対して、pageNumber、template、promptの3つのフィールドを持つJSONオブジェクトを生成してください。
- 配列形式で返してください。
`;

export async function POST(req: NextRequest) {
  try {
    const { 
      toolType, 
      scenario, 
      worldSettings, 
      pageCount, 
      genre, 
      includeCover, 
      title,
      target,
      characterImages 
    } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ページリストの生成
    const pageList = Array.from({ length: pageCount }, (_, i) => `Page ${i + 1}`);
    const expectedPages = includeCover ? ["Cover", ...pageList] : pageList;

    // プロンプトの構築（簡易版 - 実際には元のロジックを移植する必要があります）
    const prompt = `
コマ割り構成案を生成してください。

タイトル: ${title || '無題'}
ジャンル: ${genre}
ページ数: ${expectedPages.length}ページ
ターゲット: ${target || 'JP'}
世界観設定: ${worldSettings || 'なし'}

シナリオ:
${scenario}

${includeCover ? '表紙を含めて生成してください。' : ''}

各ページに対して、以下の形式でJSON配列を返してください:
[
  { "pageNumber": "Cover", "template": "T01_COVER", "prompt": "..." },
  { "pageNumber": "Page 1", "template": "T01", "prompt": "..." },
  ...
]
`;

    const responseSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pageNumber: { type: 'string' },
          template: { type: 'string' },
          prompt: { type: 'string' },
        },
        required: ['pageNumber', 'template', 'prompt'],
      },
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
            systemInstruction: SYSTEM_INSTRUCTION,
          } as any)
        );

        const response = await result.response;
        const text = response.text();
        
        // JSONの修復処理
        let cleanText = text.trim();
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const startIdx = cleanText.indexOf('[');
        const endIdx = cleanText.lastIndexOf(']');
        if (startIdx !== -1 && endIdx !== -1) {
          cleanText = cleanText.substring(startIdx, endIdx + 1);
        }

        const rows = JSON.parse(cleanText);

        // CSV文字列の生成
        const csvRows = [
          ['Page', 'Template', 'Prompt'], // ヘッダー
          ...rows.map((row: any) => [row.pageNumber, row.template, row.prompt]),
        ];
        const csvString = csvRows.map(row =>
          row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        return NextResponse.json({ 
          csvString, 
          rows: rows.map((row: any) => ({
            pageNumber: row.pageNumber,
            template: row.template,
            prompt: row.prompt,
          }))
        });
      } catch (error: any) {
        console.warn(`Failed with ${modelName}:`, error);
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error('All models failed');
  } catch (error: any) {
    console.error('Error generating panel plan:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate panel plan' },
      { status: 500 }
    );
  }
}
