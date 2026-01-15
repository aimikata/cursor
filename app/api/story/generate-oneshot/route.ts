import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';

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
あなたは、世界観構築と物語執筆のすべてを統べる「マスター・ストーリー・アーキテクト」です。
ビジネス、ファンタジー、冒険、恋愛、SFなど、あらゆるジャンルの重厚な物語を日本語で執筆します。

【最重要命令】
- 全ての出力（物語、解説、要約、マスターシートの内容）は必ず「日本語」で行ってください。
- 舞台設定が海外や英語圏であっても、地の文やセリフは極めて質の高い日本語で描写してください。

【執筆の二重構造】
1. **物語パート (The Narrative)**:
   - 提示された構成に基づき、最高峰の文芸的小説（散文）を執筆してください。
   - 脚本形式（[SCENE]等）は禁止。五感を刺激する日本語の情景描写を重視してください。
   - キャラクターの心理を深く掘り下げた、熱量の高い物語を執筆してください。

2. **深層解析パート (Deep Analysis & Lore)**:
   - 物語の背後にある「ロジック」を、日本語で詳細に解き明かしてください。
   - 解説書ベースの場合は大学院レベルの理論、ファンタジーの場合は魔法や世界の物理法則、恋愛の場合は心理学的分析を提供してください。

【文字数と熱量】
- 1章あたり12,000〜18,000文字の圧倒的な出力を目指し、読者がその世界に没入できるよう執筆してください。
`;

const seriesResponseSchema = {
  type: 'object',
  properties: {
    episode_title: { type: 'string' },
    introduction: { type: 'string', description: '本章の要約、または舞台設定。日本語で記述してください。' },
    joban: { type: 'string', description: '物語パート：前半。重厚な日本語の小説体。' },
    chuban: { type: 'string', description: '物語パート：中盤。葛藤や事件の核心。日本語。' },
    shuban: { type: 'string', description: '物語パート：後半。劇的な結末。日本語。' },
    kaisetsu: { type: 'string', description: '【深層解析・設定資料】物語の背後にある理論や世界設定の解説。日本語で記述。' },
    summary: { type: 'string', description: '次章へ繋ぐための日本語の要約。' },
    master_sheet: {
      type: 'object',
      properties: {
        progress: { type: 'string', description: '進行状況。日本語。' },
        acquisition_level: { type: 'string', description: '習得レベル。日本語。' },
        unrecovered_list: { type: 'array', items: { type: 'string' }, description: '未回収リスト。日本語。' },
        plot_points: { type: 'array', items: { type: 'string' }, description: '伏線・課題。日本語。' }
      },
      required: ['progress', 'acquisition_level', 'unrecovered_list', 'plot_points']
    }
  },
  required: ['episode_title', 'introduction', 'joban', 'chuban', 'shuban', 'kaisetsu', 'summary', 'master_sheet'],
};

function formatStory(parsed: any): string {
  return `${parsed.joban}\n\n${parsed.chuban}\n\n${parsed.shuban}`;
}

export async function POST(req: NextRequest) {
  try {
    const { worldSetting, characters, storyTheme, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    const prompt = `テーマ: ${storyTheme}\n世界観・設定: ${worldSetting}\nこの一話で完結する重厚な傑作物語を「日本語」で執筆してください。`;

    let usedModel = PRIMARY_MODEL;
    let result: any;

    try {
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      result = await fetchWithRetry(() =>
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: seriesResponseSchema as any,
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        } as any)
      );
    } catch (error: any) {
      console.warn('Primary model failed, trying fallback:', error);
      const fallbackModel = genAI.getGenerativeModel({ model: FALLBACK_MODEL });
      usedModel = FALLBACK_MODEL;
      result = await fetchWithRetry(() =>
        fallbackModel.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: seriesResponseSchema as any,
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        } as any)
      );
    }

    const response = await result.response;
    const text = response.text();
    const parsed = JSON.parse(text);

    const episode = {
      title: parsed.episode_title,
      story: formatStory(parsed),
      summary: parsed.summary,
      introduction: parsed.introduction,
      commentary: parsed.kaisetsu,
      masterSheet: parsed.master_sheet,
      generatedBy: usedModel,
    };

    return NextResponse.json({ episode, usedModel });
  } catch (error: any) {
    console.error('Error generating oneshot story:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate oneshot story' },
      { status: 500 }
    );
  }
}
