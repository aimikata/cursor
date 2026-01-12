
import { GoogleGenAI, Type } from "@google/genai";
import { MangaInput, CsvRow, Genre } from "../types";
import { SYSTEM_INSTRUCTION, GENRES } from "../constants";

const MODELS_TO_TRY = ["gemini-3-pro-preview", "gemini-3-flash-preview"];

const repairTruncatedJson = (jsonString: string): any[] | null => {
  let clean = jsonString.trim();
  clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  
  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) { }
  
  if (clean.endsWith(',')) clean = clean.slice(0, -1);
  if (!clean.endsWith(']')) {
      const lastObjEnd = clean.lastIndexOf('}');
      if (lastObjEnd !== -1) {
          clean = clean.substring(0, lastObjEnd + 1) + ']';
      } else {
          clean += ']';
      }
  }

  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    console.warn("JSON Repair Failed:", e);
  }
  return null;
};

export const analyzeScenario = async (
  scenario: string,
  worldSettings: string | undefined
): Promise<{ pageCount: number; genre: Genre }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `このYouTubeマンガの台本を分析し、全内容を網羅するために必要なスライド枚数を見積もってください。
  1枚あたり上下2枚のパネル構成を前提に、最後まで描き切るための最適な枚数を提示してください。
  台本: ${scenario}`;

  let lastError: any;
  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pageCount: { type: Type.INTEGER },
              genre: { type: Type.STRING },
            },
            required: ["pageCount", "genre"],
          },
        },
      });
      if (!response.text) throw new Error("No response");
      let result = JSON.parse(response.text);
      return { 
        pageCount: Math.max(8, Math.min(100, result.pageCount || 32)), 
        genre: (GENRES.includes(result.genre as Genre) ? result.genre : 'ビジネス・自己啓発') as Genre 
      };
    } catch (error: any) {
      lastError = error;
      continue;
    }
  }
  throw new Error(lastError?.message || "Analysis failed.");
};

export const generateMangaPlan = async (
  input: MangaInput
): Promise<{ csvString: string; rows: CsvRow[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 動的なキャラクター紐付け
  const characterInstructions = input.characterImages.map((img, i) => {
    return `IMAGE [REF_IMG_${i+1}] is associated with the file "${img.name}". Identify which character this belongs to based on the filename or context and use it consistently.`;
  }).join('\n');

  const promptText = `
**【制作命令：YouTubeマンガ構成案】**
全 **${input.pageCount} 枚** の構成を作成してください。

**1. キャラクター設定**:
${characterInstructions}
${input.worldSettings ? `追加のキャラクター・世界観設定:\n${input.worldSettings}` : ''}

**2. 演出方針・コンセプト**:
${input.channelConcept || '特に指定なし。内容に合わせて最適な演出を行ってください。'}

**3. 2パネル構成（上下段）の徹底**:
Slide 2以降、全ての画像プロンプトを「[Upper Panel: ...], [Lower Panel: ...]」の形式で出力してください。

**4. 完結の義務**:
提供された台本の内容を ${input.pageCount - 1} 枚に適切に配分し、最後のスライドで必ず台本の結末を描いてください。

**入力台本**:
${input.scenario}
`;

  const parts: any[] = [{ text: promptText }];
  input.characterImages.forEach((img, i) => {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
    parts.push({ text: `[REF_IMG_${i+1}: "${img.name}"]` });
  });

  let lastError: any;
  for (const modelName of MODELS_TO_TRY) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 16000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pageNumber: { type: Type.STRING },
                template: { type: Type.STRING },
                scriptSegment: { type: Type.STRING },
                prompt: { type: Type.STRING, description: "Must follow the [Upper Panel: ...], [Lower Panel: ...] format." },
              },
              required: ["pageNumber", "template", "scriptSegment", "prompt"],
            },
          },
        },
      });

      let text = response.text || "";
      let jsonStr = text.replace(/^```json|```$/g, '').trim();
      let json: any[];
      try {
          json = JSON.parse(jsonStr);
      } catch (e) {
          json = repairTruncatedJson(jsonStr) || [];
      }
      
      if (!json || json.length === 0) throw new Error("構成案の生成に失敗しました。");

      const rows: CsvRow[] = json.map((item: any, idx: number) => ({
        pageNumber: item.pageNumber || `Slide ${idx + 1}`,
        template: item.template || "8:9 Stacked",
        scriptSegment: item.scriptSegment || "N/A",
        prompt: item.prompt || "(⚠️ Error: Prompt missing)"
      }));

      const header = "Slide,Shot Type,Corresponding Script (JP),Visual Image Prompt (EN)";
      const csvLines = rows.map(r => {
        const sSafe = r.scriptSegment.replace(/"/g, '""').replace(/\n/g, ' ');
        const pSafe = r.prompt.replace(/"/g, '""');
        return `"${r.pageNumber}","${r.template}","${sSafe}","${pSafe}"`;
      });

      return { csvString: [header, ...csvLines].join('\n'), rows };
    } catch (error: any) {
      console.error(`Model ${modelName} failed:`, error);
      lastError = error;
      continue;
    }
  }
  throw new Error(lastError?.message || "生成に失敗しました。");
};
