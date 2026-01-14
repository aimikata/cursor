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

// SYSTEM_INSTRUCTIONは元のコマ割りツールから移植
const SYSTEM_INSTRUCTION = `
あなたは、プロフェッショナルなマンガディレクターAIです。
ユーザーのシナリオと設定に基づいて、詳細な画像生成プロンプトを作成します。

【最重要命令】
- 全ての出力は必ず「日本語」で行ってください。
- 指定されたページ数分、すべてのページのプロンプトを生成してください。
- 表紙は生成しません（表紙生成は独立ツールを使用してください）。
- 章扉（Chapter Title Page）が指定されている場合は、Page 1を章扉として生成してください。

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
      includeChapterTitle,
      title,
      chapterTitle,
      target,
      characterImages,
      apiKey
    } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // ページリストの生成（表紙生成機能は独立ツールに移行したため、常に表紙なし）
    // 章扉を含める場合は、Page 1を章扉として扱う
    const pageList = Array.from({ length: pageCount }, (_, i) => `Page ${i + 1}`);
    const expectedPages = pageList; // 表紙は含めない（章扉はPage 1として含まれる）

    // 章扉の指示を追加
    const chapterTitleInstruction = includeChapterTitle && pageCount > 1
      ? `\n**重要**: Page 1は章扉（Chapter Title Page / Tobira）として生成してください。Template: T01_CHAPTER_COVER。章タイトル「${chapterTitle || title || 'Chapter 1'}」を表示する象徴的な見開きイラストとして作成してください。`
      : '';

    // プロンプトの構築（簡易版 - 実際には元のロジックを移植する必要があります）
    const prompt = `
コマ割り構成案を生成してください。

タイトル: ${title || '無題'}
章タイトル: ${chapterTitle || title || 'Chapter 1'}
ジャンル: ${genre}
ページ数: ${expectedPages.length}ページ
ターゲット: ${target || 'JP'}
世界観設定: ${worldSettings || 'なし'}
${chapterTitleInstruction}

シナリオ:
${scenario}

各ページに対して、以下の形式でJSON配列を返してください:
${includeChapterTitle && pageCount > 1
  ? `[
  { "pageNumber": "Page 1", "template": "T01_CHAPTER_COVER", "prompt": "章扉: ${chapterTitle || title || 'Chapter 1'}を表示する象徴的な見開きイラスト..." },
  { "pageNumber": "Page 2", "template": "T01", "prompt": "..." },
  ...
]`
  : `[
  { "pageNumber": "Page 1", "template": "T01", "prompt": "..." },
  { "pageNumber": "Page 2", "template": "T01", "prompt": "..." },
  ...
]`}
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
