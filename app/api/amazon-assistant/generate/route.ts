import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeneratedContent, AllImagePayloads } from '@/app/lib/amazon-assistant/types';

const MODELS_TO_TRY = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5'];

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

const SYSTEM_INSTRUCTION = `
あなたは、Amazon KDPのベストセラー作家兼マーケティングコンサルタントです。
ユーザーが提供する書籍のコンセプトに基づいて、KDPの出版申請画面にそのままコピペできる完璧な申請データと、戦略的なマーケティング資料を作成してください。
`;

export async function POST(req: NextRequest) {
  try {
    const { promptText, images, language, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    if (!promptText || !images || !images.character || !images.memorable1 || !images.memorable2 || !images.memorable3) {
      return NextResponse.json(
        { error: 'Missing required fields: promptText and images (character, memorable1, memorable2, memorable3) are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    const isEnglish = language === 'en';
    
    const languageInstruction = isEnglish 
      ? `
        # Language Settings
        - **Target Market**: English speaking countries (US, UK, etc.).
        - **Output Language**: Generate Title, Subtitle, Keywords, and Main Content in **English**.
        - **Translation Requirement**: For the **'Description'** field and **'A+ Content description'** fields, YOU MUST append a Japanese translation below the English text.
        - **Currency**: Suggest price in USD (e.g., $9.99).
      `
      : `
        # 言語設定
        - **ターゲット市場**: 日本 (Japan)。
        - **出力言語**: 全て **日本語** で出力してください。
        - **通貨**: 日本円 (JPY) で提案してください。
      `;

    const basePrompt = `
      ${languageInstruction}

      # 提供情報
      ${promptText}

      # 画像情報
      - キャラクター画像
      - 印象的な画像1, 2, 3
      ${images.author ? '- 著者プロフィール画像' : ''}
    `;

    const generationTaskPrompt = `
      # 生成タスク: Amazon KDP 出版申請完全パッケージ

      以下のセクションに従って、具体的かつ戦略的な内容を生成してください。

      ## 1. Kindle本の詳細 (KDP Details)
      - **タイトル/サブタイトル**: SEOを意識し、クリック率を高める魅力的なタイトルを考案してください。
      - **キーワード**: 検索ボリュームがあり、かつ競合の隙間を突く7つのキーワードを選定してください。
      - **カテゴリー**: ベストセラーバッジを取りやすい、関連性の高いカテゴリーを必ず**3つ**選定してください。
      - **紹介文**: Amazonページ用紹介文。HTMLタグ込みで4000文字以内のSEO対策テキスト。

      ## 2. A+コンテンツ戦略
      - 読者の購買意欲を決定づけるA+コンテンツの構成案を5つのモジュールで作成してください。
      - 各モジュールのテキストは簡潔にし、提供された画像をどう配置するか具体的に指示してください。
    `;

    const parts: any[] = [
      { text: basePrompt + '\n\n' + generationTaskPrompt }
    ];

    // 画像を追加
    if (images.character) {
      parts.push({
        inlineData: {
          mimeType: images.character.mimeType,
          data: images.character.data
        }
      });
      parts.push({ text: '[キャラクター画像]' });
    }

    if (images.memorable1) {
      parts.push({
        inlineData: {
          mimeType: images.memorable1.mimeType,
          data: images.memorable1.data
        }
      });
      parts.push({ text: '[印象的な画像1]' });
    }

    if (images.memorable2) {
      parts.push({
        inlineData: {
          mimeType: images.memorable2.mimeType,
          data: images.memorable2.data
        }
      });
      parts.push({ text: '[印象的な画像2]' });
    }

    if (images.memorable3) {
      parts.push({
        inlineData: {
          mimeType: images.memorable3.mimeType,
          data: images.memorable3.data
        }
      });
      parts.push({ text: '[印象的な画像3]' });
    }

    if (images.author) {
      parts.push({
        inlineData: {
          mimeType: images.author.mimeType,
          data: images.author.data
        }
      });
      parts.push({ text: '[著者プロフィール画像]' });
    }

    let lastError: any;
    for (const modelName of MODELS_TO_TRY) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const response = await fetchWithRetry(() => model.generateContent({
          contents: [{ role: 'user', parts }],
          systemInstruction: SYSTEM_INSTRUCTION,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                kdpDetails: {
                  type: 'object',
                  properties: {
                    language: { type: 'string' },
                    title: { type: 'string' },
                    titleKana: { type: 'string' },
                    titleRomaji: { type: 'string' },
                    subtitle: { type: 'string' },
                    subtitleKana: { type: 'string' },
                    subtitleRomaji: { type: 'string' },
                    seriesName: { type: 'string' },
                    seriesVolume: { type: 'string' },
                    author: { type: 'string' },
                    description: { type: 'string' },
                    publishingRights: { type: 'string' },
                    keywords: { type: 'array', items: { type: 'string' } },
                    categories: { type: 'array', items: { type: 'string' } },
                    adultContent: { type: 'string' },
                  },
                  required: ['language', 'title', 'description', 'keywords', 'categories'],
                },
                kdpContent: {
                  type: 'object',
                  properties: {
                    drm: { type: 'string' },
                    manuscriptFileName: { type: 'string' },
                    coverFileName: { type: 'string' },
                    aiGeneratedContent: { type: 'string' },
                  },
                },
                kdpPricing: {
                  type: 'object',
                  properties: {
                    kdpSelect: { type: 'string' },
                    marketplace: { type: 'string' },
                    territory: { type: 'string' },
                    royaltyPlan: { type: 'string' },
                    price: { type: 'string' },
                  },
                },
                aPlusContent: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      moduleName: { type: 'string' },
                      purpose: { type: 'string' },
                      imageSuggestion: { type: 'string' },
                      bigHeadline: { type: 'string' },
                      headline: { type: 'string' },
                      description: { type: 'string' },
                    },
                  },
                },
              },
            } as any,
          },
        }));

        const generatedText = response?.response?.text?.() ?? '';
        let cleanText = generatedText.trim();

        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        if (!cleanText) {
          throw new Error('Empty response from model');
        }

        const startIdx = cleanText.indexOf('{');
        const endIdx = cleanText.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          cleanText = cleanText.substring(startIdx, endIdx + 1);
        }

        const parsed = JSON.parse(cleanText);

        return NextResponse.json({
          ...parsed,
          usedModel: modelName
        } as GeneratedContent);
      } catch (error: any) {
        lastError = error;
        console.warn(`Model ${modelName} failed:`, error);
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error('Error generating Amazon assistant content:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
