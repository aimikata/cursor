
import { GoogleGenAI, Part, Content, Type } from "@google/genai";
import type { Character, Episode, MasterSheet } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const PRIMARY_MODEL = 'gemini-3-pro-preview';
const FALLBACK_MODEL = 'gemini-3-flash-preview';
const MAX_THINKING_BUDGET = 32768;

const seriesResponseSchema = {
  type: Type.OBJECT,
  properties: {
    episode_title: { type: Type.STRING },
    introduction: { type: Type.STRING, description: '本章の要約、または舞台設定。日本語で記述してください。' },
    joban: { type: Type.STRING, description: '物語パート：前半。重厚な日本語の小説体。' },
    chuban: { type: Type.STRING, description: '物語パート：中盤。葛藤や事件の核心。日本語。' },
    shuban: { type: Type.STRING, description: '物語パート：後半。劇的な結末。日本語。' },
    kaisetsu: { type: Type.STRING, description: '【深層解析・設定資料】物語の背後にある理論や世界設定の解説。日本語で記述。' },
    summary: { type: Type.STRING, description: '次章へ繋ぐための日本語の要約。' },
    master_sheet: {
      type: Type.OBJECT,
      properties: {
        progress: { type: Type.STRING, description: '進行状況。日本語。' },
        acquisition_level: { type: Type.STRING, description: '習得レベル。日本語。' },
        unrecovered_list: { type: Type.ARRAY, items: { type: Type.STRING }, description: '未回収リスト。日本語。' },
        plot_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: '伏線・課題。日本語。' }
      },
      required: ['progress', 'acquisition_level', 'unrecovered_list', 'plot_points']
    }
  },
  required: ['episode_title', 'introduction', 'joban', 'chuban', 'shuban', 'kaisetsu', 'summary', 'master_sheet'],
};

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

const formatStory = (parsed: any) => `${parsed.joban}\n\n${parsed.chuban}\n\n${parsed.shuban}`;

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 3000): Promise<T> {
  try { return await fn(); } catch (error: any) {
    const errorMsg = error.message || '';
    if (retries > 0 && (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('500'))) {
      await new Promise(r => setTimeout(r, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

async function withFallback<T>(operation: (model: string) => Promise<T>): Promise<{ value: T; usedModel: string }> {
  try { return { value: await operation(PRIMARY_MODEL), usedModel: PRIMARY_MODEL }; } catch {
    return { value: await operation(FALLBACK_MODEL), usedModel: FALLBACK_MODEL };
  }
}

export async function generateChapterContent(seriesTitle: string, chapterTitle: string, tocList: string, worldSetting: string, characters: Character[]): Promise<{ episode: Episode; usedModel: string }> {
  const charDetails = characters.map(c => `【${c.name}】: ${c.role}`).join('\n');
  const prompt = `
シリーズ名: ${seriesTitle}
本章タイトル: ${chapterTitle}
構成案（物語 ＆ 解析）:
${tocList}

世界観・ルール設定:
${worldSetting}

キャラクター設定:
${charDetails}

【依頼】
この構成に基づき、1.5万文字級の圧倒的密度で執筆してください。
出力はすべて日本語で行ってください。
`;
  const { value, usedModel } = await withFallback(m => callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: m, contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_INSTRUCTION, responseMimeType: 'application/json', responseSchema: seriesResponseSchema, thinkingConfig: { thinkingBudget: MAX_THINKING_BUDGET } }
    });
    const parsed = JSON.parse(response.text || '{}');
    return { ...parsed, title: parsed.episode_title, story: formatStory(parsed), commentary: parsed.kaisetsu, masterSheet: parsed.master_sheet, generatedBy: m };
  }));
  return { episode: value, usedModel };
}

export async function generateFirstEpisode(worldSetting: string, characters: Character[], storyTheme: string, episodeTitle: string): Promise<{ episode: Episode; history: Content[]; usedModel: string }> {
  const charDetails = characters.map(c => `【${c.name}】: ${c.role}`).join('\n');
  const prompt = `世界観・設定: ${worldSetting}\n連載全体のテーマ・未回収リスト: ${storyTheme}\n第1章タイトル案: ${episodeTitle}\n登場人物:\n${charDetails}\n\n第1章を「日本語」で執筆してください。`;
  const { value, usedModel } = await withFallback(m => callWithRetry(async () => {
    const userContent: Content = { role: 'user', parts: [{ text: prompt }] };
    const response = await ai.models.generateContent({
      model: m, contents: [userContent],
      config: { systemInstruction: SYSTEM_INSTRUCTION, responseMimeType: 'application/json', responseSchema: seriesResponseSchema, thinkingConfig: { thinkingBudget: MAX_THINKING_BUDGET } }
    });
    const parsed = JSON.parse(response.text || '{}');
    return { 
      episode: { ...parsed, title: parsed.episode_title, story: formatStory(parsed), commentary: parsed.kaisetsu, masterSheet: parsed.master_sheet, generatedBy: m },
      history: [userContent, { role: 'model', parts: [{ text: response.text }] }]
    };
  }));
  return { ...value, usedModel };
}

export async function generateNextEpisode(previousSummary: string, worldSetting: string, characters: Character[], storyTheme: string, episodeNumber: number, episodeTitle: string, history: Content[], previousMasterSheet?: MasterSheet): Promise<{ episode: Episode; history: Content[]; usedModel: string }> {
  const masterSheetContext = previousMasterSheet ? `現状進行度: ${previousMasterSheet.progress}\n未回収・伏線: ${previousMasterSheet.unrecovered_list.join(',')}` : '';
  const followupPrompt = `前章までのあらすじ: ${previousSummary}\n${masterSheetContext}\n第${episodeNumber}章（タイトル: ${episodeTitle}）を「日本語」で執筆してください。`;
  const newHistory = [...history, { role: 'user', parts: [{ text: followupPrompt }] }];
  const { value, usedModel } = await withFallback(m => callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: m, contents: newHistory,
      config: { systemInstruction: SYSTEM_INSTRUCTION, responseMimeType: 'application/json', responseSchema: seriesResponseSchema, thinkingConfig: { thinkingBudget: MAX_THINKING_BUDGET } }
    });
    const parsed = JSON.parse(response.text || '{}');
    return { 
      episode: { ...parsed, title: parsed.episode_title, story: formatStory(parsed), commentary: parsed.kaisetsu, masterSheet: parsed.master_sheet, generatedBy: m },
      history: [...newHistory, { role: 'model', parts: [{ text: response.text }] }]
    };
  }));
  return { ...value, usedModel };
}

export async function generateOneShotStory(worldSetting: string, characters: Character[], storyTheme: string): Promise<{ episode: Episode; usedModel: string }> {
  const prompt = `テーマ: ${storyTheme}\n世界観・設定: ${worldSetting}\nこの一話で完結する重厚な傑作物語を「日本語」で執筆してください。`;
  const { value, usedModel } = await withFallback(m => callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: m, contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { systemInstruction: SYSTEM_INSTRUCTION, responseMimeType: 'application/json', responseSchema: seriesResponseSchema, thinkingConfig: { thinkingBudget: MAX_THINKING_BUDGET } }
    });
    const parsed = JSON.parse(response.text || '{}');
    return { ...parsed, title: parsed.episode_title, story: formatStory(parsed), commentary: parsed.kaisetsu, masterSheet: parsed.master_sheet, generatedBy: m };
  }));
  return { episode: value, usedModel };
}

export async function generateEpisodeTitles(worldSetting: string, characters: Character[], storyTheme: string): Promise<{ titles: string[]; usedModel: string }> {
  const titlesSchema = { type: Type.OBJECT, properties: { titles: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['titles'] };
  const { value, usedModel } = await withFallback(m => callWithRetry(async () => {
    const response = await ai.models.generateContent({ 
      model: m, contents: [{ role: 'user', parts: [{ text: `世界観: ${worldSetting}\nテーマ: ${storyTheme}\n魅力的な日本語のサブタイトルを12章分作成してください。` }] }], 
      config: { systemInstruction: "敏腕編集者として、日本語でタイトルを考案してください。", responseMimeType: 'application/json', responseSchema: titlesSchema } 
    });
    return JSON.parse(response.text || '{"titles":[]}');
  }));
  return { titles: value.titles, usedModel };
}

export async function generateProjectTitle(worldSetting: string, storyTheme: string): Promise<string> {
  const { value } = await withFallback(m => callWithRetry(async () => {
    const response = await ai.models.generateContent({ 
      model: m, contents: [{ role: 'user', parts: [{ text: `世界観: ${worldSetting}\nテーマ: ${storyTheme}\n日本語のメインタイトルを1つ考案してください。` }] }],
      config: { systemInstruction: "日本語のみ。タイトル1つ。" }
    });
    return response.text?.trim() || "無題の物語";
  }));
  return value;
}
