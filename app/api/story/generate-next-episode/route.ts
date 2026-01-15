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

function getModeInstruction(mode?: string): string {
  if (mode === 'chapter') {
    return `【モード: MASTER】\n- 物語パートは要点重視で簡潔に。\n- 解説（深層解析）とマスターシートを最重要視し、学習ポイント・設計意図・次章への設計課題を具体的に書くこと。`;
  }
  return `【モード: 連載】\n- 次章への引きと未回収要素を必ず残す。\n- 章全体の流れがシリーズ構成と整合するように執筆する。`;
}

export async function POST(req: NextRequest) {
  try {
    const { previousSummary, worldSetting, characters, storyTheme, episodeNumber, episodeTitle, history, previousMasterSheet, volumeNumber, generationMode, masterInput, apiKey } = await req.json();
    
    // リクエストボディからAPIキーを取得、なければ環境変数を使用
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    const masterSheetContext = previousMasterSheet 
      ? `現状進行度: ${previousMasterSheet.progress}\n未回収・伏線: ${previousMasterSheet.unrecovered_list?.join(',') || ''}` 
      : '';
    const charDetails = characters.map((c: any) => `【${c.name}】: ${c.role || c.description || ''}`).join('\n');
    const resolvedEpisodeNumber = Number.isInteger(episodeNumber) && episodeNumber > 0 ? episodeNumber : 1;
    const resolvedVolumeNumber = Number.isInteger(volumeNumber) && volumeNumber > 0 ? volumeNumber : 1;
    const modeInstruction = getModeInstruction(generationMode);
    const masterSection = generationMode === 'chapter' && masterInput ? `
WORLDVIEW SETTING:
- Core Rule: ${masterInput.worldviewSetting?.coreRule || ''}
- Merit: ${masterInput.worldviewSetting?.merit || ''}
- Demerit: ${masterInput.worldviewSetting?.demerit || ''}

CHARACTER SETTING:
${masterInput.characterSetting || ''}

SERIES / VOLUME:
- Series Title: ${masterInput.series?.title || ''}
- Volume: Vol.${masterInput.series?.volumeNumber || resolvedVolumeNumber}${masterInput.series?.volumeTitle ? ` / ${masterInput.series.volumeTitle}` : ''}

CHAPTER:
- Chapter: ${masterInput.chapter?.number || resolvedEpisodeNumber}
- Title: ${masterInput.chapter?.title || episodeTitle || ''}

DRAFT PLAN:
- Manga Part (Story): ${masterInput.draftPlan?.mangaPart || ''}
- Commentary Part (Theory): ${masterInput.draftPlan?.commentaryPart || ''}
`.trim() : '';
    const baseContext = generationMode === 'chapter' && masterSection
      ? `MASTER SHEET INPUT (MUST FOLLOW EXACTLY):\n${masterSection}`
      : `世界観・設定: ${worldSetting}\n連載全体のテーマ・未回収リスト: ${storyTheme}\n登場人物:\n${charDetails}\n\n前章までのあらすじ: ${previousSummary}\n${masterSheetContext}`;
    const followupPrompt = `${baseContext}\n\n${modeInstruction}\n\n【厳守】\n- 登場人物は「提示された人物リスト」に含まれる固有名のみを使用すること（未定義の家族・同僚・友人を追加しない）。\n- 提示されたMASTER SHEETの項目構成に完全準拠すること。\n- episode_title は必ず「Vol.${resolvedVolumeNumber} Chapter ${resolvedEpisodeNumber}: <章タイトル>」の形式で出力すること。\n- 章タイトルは指定があればそれを優先し、未指定なら文脈に合うタイトルを付与すること。\n- 物語パートは「情熱的で没入感のある描写」。解説パートは「大学院レベルの高度な分析」。\n\n第${resolvedEpisodeNumber}章（タイトル: ${episodeTitle || ''}）を「日本語」で執筆してください。`;

    // 履歴を構築（簡易版：実際の実装ではContent[]形式に変換が必要）
    const newHistory = history ? [...history, { role: 'user', parts: [{ text: followupPrompt }] }] : [{ role: 'user', parts: [{ text: followupPrompt }] }];

    let usedModel = PRIMARY_MODEL;
    let result: any;

    try {
      const model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
      result = await fetchWithRetry(() =>
        model.generateContent({
          contents: [{ role: 'user', parts: [{ text: followupPrompt }] }],
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
          contents: [{ role: 'user', parts: [{ text: followupPrompt }] }],
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

    const updatedHistory = [...newHistory, { role: 'model', parts: [{ text: text }] }];

    return NextResponse.json({ episode, history: updatedHistory, usedModel });
  } catch (error: any) {
    console.error('Error generating next episode:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate next episode' },
      { status: 500 }
    );
  }
}
