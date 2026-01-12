import { GoogleGenAI, Type } from "@google/genai";
import { MangaInput, CsvRow, Genre, MangaMode } from "../types";
import { SYSTEM_INSTRUCTION, GENRES } from "../constants";

// 優先順位の高い順にモデルを定義
const MODELS_TO_TRY = ["gemini-3-pro-preview", "gemini-2.5-flash"];

/**
 * JSON修復ロジック (強化版)
 * トークン制限などでJSONが途切れた場合に、配列を閉じてパース可能な状態への復旧を試みます。
 */
const repairTruncatedJson = (jsonString: string): any[] | null => {
  let clean = jsonString.trim();
  // マークダウン記法の除去
  clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  
  // 1. そのままパースを試みる
  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // 失敗したら修復へ
  }

  // 2. 配列の閉じ括弧がない場合、強制的に閉じてみる
  
  // 末尾がカンマなら削除
  if (clean.endsWith(',')) {
      clean = clean.slice(0, -1);
  }
  
  // 閉じ括弧が足りない場合を想定して補完
  if (!clean.endsWith(']')) {
      // 最後の有効なオブジェクトの閉じ括弧を探す
      const lastObjEnd = clean.lastIndexOf('}');
      if (lastObjEnd !== -1) {
          // 最後のオブジェクトまでで切り取り、配列を閉じる
          clean = clean.substring(0, lastObjEnd + 1) + ']';
      } else {
          // とりあえず閉じてみる
          clean += ']';
      }
  }

  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) {
        console.log(`Successfully repaired truncated JSON. Recovered ${parsed.length} items.`);
        return parsed;
    }
  } catch (e) {
    console.error("JSON Repair Failed:", e);
  }

  return null;
};

export const analyzeScenario = async (
  scenario: string,
  worldSettings: string | undefined,
  mode: MangaMode = 'story',
  apiKey?: string
): Promise<{ pageCount: number; genre: Genre }> => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error("APIキーが設定されていません。");
  }

  const ai = new GoogleGenAI({ apiKey: key });

  const estimationRules = mode === 'explanatory' 
     ? `- **EXPLANATORY/PRACTICAL BOOK**: 
        - DO NOT compress content. 
        - **1 Topic/Concept = 3-4 Pages** (Intro -> Theory -> Diagram -> Example).
        - If the text has Intro, Theory, and Examples, that is at least **8-10 pages**.
        - Minimum suggestion: 8 pages (unless text is extremely short).`
     : `- **STORY MANGA**:
        - 1 page per 150-200 characters of text, or 1 page per major action/beat.
        - If the scenario is short (< 500 chars), suggestion: 4-8 pages.`;

  const prompt = `
You are a professional Manga Editor.
Analyze the following scenario text and world settings.

Task:
1. Determine the most appropriate Genre from this list: ${JSON.stringify(GENRES)}.
2. Estimate the appropriate Page Count (number of pages) required to draw this scenario as a manga.
   - **Mode: ${mode}**

   **Estimation Rules:**
   ${estimationRules}
   - Maximum page count suggestion: 50.

Scenario:
${scenario}

World Settings:
${worldSettings || "None"}
`;

  let lastError: any;

  // モデルフォールバックループ
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Attempting analysis with model: ${modelName}`);
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

      if (!response.text) {
        throw new Error("No response from AI");
      }

      let result;
      try {
        result = JSON.parse(response.text);
      } catch (e) {
        // Fallback cleanup
        const text = response.text.replace(/```json|```/g, '').trim();
        try {
          result = JSON.parse(text);
        } catch (e2) {
           console.warn("Analysis JSON parse failed, using defaults.");
           return { pageCount: 8, genre: 'AIおまかせ' };
        }
      }

      // Validate Genre
      let genre: Genre = 'AIおまかせ';
      if (result.genre && GENRES.includes(result.genre as Genre)) {
        genre = result.genre as Genre;
      }

      // Validate Page Count
      let pageCount = 4;
      if (typeof result.pageCount === 'number') {
        pageCount = Math.max(1, Math.min(50, result.pageCount));
      }

      // Force minimum for explanatory if it seems low but text is present
      if (mode === 'explanatory' && pageCount < 6 && scenario.length > 200) {
          pageCount = 8;
      }

      // 成功したらリターン
      return { pageCount, genre };

    } catch (error: any) {
      console.warn(`Failed with ${modelName}:`, error);
      lastError = error;
      // 次のモデルへループ継続
      continue;
    }
  }

  // 全てのモデルで失敗した場合
  console.error("Analyze Scenario Error (All models failed):", lastError);
  throw new Error(lastError?.message || "Failed to analyze scenario with all available models.");
};

export const generateMangaPlan = async (
  input: MangaInput,
  apiKey?: string
): Promise<{ csvString: string; rows: CsvRow[] }> => {
  const key = apiKey || process.env.API_KEY;

  if (!key) {
    throw new Error("APIキーが設定されていません。設定画面からキーを入力してください。");
  }

  const ai = new GoogleGenAI({ apiKey: key });

  // Calculate density
  const charCount = input.scenario.length;
  const charsPerPage = input.pageCount > 0 ? charCount / input.pageCount : 200;
  
  // Required pages list
  const pageList = Array.from({ length: input.pageCount }, (_, i) => `Page ${i + 1}`);
  const expectedPages = input.includeCover ? ["Cover", ...pageList] : pageList;
  
  // --- STRICT PAGE ALLOCATION BLUEPRINT ---
  const blueprint = expectedPages.map((p, i) => {
    // 1. COVER Handling (Series Cover)
    if (p === "Cover") {
        return `- "${p}": 【Series Cover (Book Jacket)】 Main Title "${input.title}", Author "${input.author}". High-quality illustration for the book cover.`;
    }

    const pageNum = parseInt(p.replace("Page ", ""));
    const isSinglePage = input.pageCount === 1;

    // 2. PAGE 1 Handling: Chapter Title Page (Tobira)
    // Unless it's a 1-page manga, Page 1 is reserved for Chapter Title.
    if (pageNum === 1 && !isSinglePage) {
        return `- "${p}": 【Chapter Title Page (Tobira)】 **Template: T01_CHAPTER_COVER**. Show Chapter Title "${input.chapterTitle || 'Chapter 1'}". A symbolic full-page illustration introducing the episode.`;
    }

    // 3. CONTENT PAGES (Page 2+)
    // Calculate ratio based on remaining pages (excluding Page 1 which is Tobira)
    const totalContentPages = isSinglePage ? 1 : input.pageCount - 1;
    const currentContentIndex = isSinglePage ? 0 : pageNum - 2; // If starts at Page 2, index 0.
    const ratio = (currentContentIndex + 1) / totalContentPages;

    if (input.mode === 'explanatory') {
        // Explanatory Logic
        if (ratio <= 0.2) {
             return `- "${p}": 【Introduction】 Hook the reader. Use the specific episode/story from the scenario to show the problem.`;
        } else if (ratio <= 0.5) {
             return `- "${p}": 【Theory/Concept】 Main explanation. Visualize the specific concepts.`;
        } else if (ratio <= 0.8) {
             return `- "${p}": 【Example/Application】 Practical case. Use the specific examples from the scenario.`;
        } else {
             return `- "${p}": 【Summary/Q&A】 Conclusion. Wrap up based on the scenario's ending.`;
        }
    } else {
        // Story Logic
        if (ratio < 0.25) return `- "${p}": 【Introduction】 Hook, Setting, Character Intro.`;
        else if (ratio < 0.75) return `- "${p}": 【Development】 Rising action, conflict, dialogue.`;
        else if (ratio < 0.9) return `- "${p}": 【Climax】 Peak emotional/physical moment.`;
        else return `- "${p}": 【Conclusion】 Resolution and aftermath.`;
    }
  }).join("\n");

  let expansionInstruction = "";
  if (charsPerPage < 150) {
     if (input.mode === 'explanatory') {
        expansionInstruction = `
**⚠️ CONTENT ELABORATION REQUIRED (EXPLANATORY MODE)**
The scenario is short for ${input.pageCount} pages.
**YOU MUST EXPAND EACH SECTION:**
1.  **Introduction**: Do not just say "Intro". Show the character struggling with the problem.
2.  **Theory**: Split one concept into multiple pages.
3.  **Examples**: Create a specific "Hypothetical Scenario".
4.  **Do NOT summarize**. If you run out of text, create a "Q&A" page or "Checklist" page.
`;
     } else {
        expansionInstruction = `
**⚠️ NARRATIVE EXPANSION REQUIRED (STORY MODE)**
The scenario is short. To fill ${input.pageCount} pages, you must **EXPAND THE SCRIPT**:
1.  **Add Dialogue**: Turn single lines into full conversations.
2.  **Add Incidents**: Add small events or obstacles.
`;
     }
  }

  let modeSpecificRules = "";
  if (input.mode === 'explanatory') {
    modeSpecificRules = `- **EXPLANATORY MODE RULES**:
     - **Layouts**: Mix **T01_MENTOR** (Lecture), **T01_FULL** (Diagram), **T01_STEP** (Process).
     - **Story Integration (CRITICAL)**: **YOU MUST USE THE PROVIDED SCENARIO CONTENT.** Do not create a generic textbook. If the scenario contains a story (e.g., Alex's failure), use it as the core of the explanation.
     - **Characters**: Make the characters (e.g., Mentor and Student) act out the scenario.`;
  } else {
    modeSpecificRules = `- **STORY MODE RULES**: 
     - Use standard manga templates. Focus on emotion and flow.`;
  }

  const titleContext = `
Series Title: ${input.title}
Volume: ${input.volume || 'N/A'}
Subtitle: ${input.subtitle || 'N/A'}
Catchphrase/Tagline: ${input.catchphrase || 'N/A'}
Author: ${input.author || 'N/A'}
Chapter Title: ${input.chapterTitle || 'N/A'}
`;

  const promptText = `
Request Details:
- Mode: ${input.mode}
${titleContext}
- Target Audience: ${input.target}
- Genre: ${input.genre}
- **REQUIRED PAGE COUNT: ${expectedPages.length} PAGES TOTAL** (Including Cover if requested)
- World Settings: ${input.worldSettings || "N/A"}

${expansionInstruction}

**PAGE ALLOCATION BLUEPRINT**:
${blueprint}

**CRITICAL INSTRUCTION ON BATCH GENERATION**:
You are generating a **BATCH** of prompts. 
You MUST output a single JSON array containing **EXACTLY ${expectedPages.length} objects**.
**DO NOT STOP after the Cover.** You MUST process ALL pages from "${expectedPages[0]}" to "${expectedPages[expectedPages.length - 1]}".

**MODE SPECIFIC RULES**:
${modeSpecificRules}

**MANDATORY FIELDS**:
- **Text Bubble**: Every single panel MUST have a "Text Bubble" line.
- **FORMAT**: \`* **Text Bubble: (SpeakerName)** "Dialogue"\`
- **Text SFX**: Use this for sound effects.

**OUTPUT FORMAT**:
You must return a **VALID JSON ARRAY** strictly matching this structure.
The array must contain exactly ${expectedPages.length} items.

[
  { "pageNumber": "Cover", "template": "T01_COVER", "prompt": "..." },
  { "pageNumber": "Page 1", "template": "T01_CHAPTER_COVER", "prompt": "..." },
  { "pageNumber": "Page 2", "template": "T02", "prompt": "..." },
  ... (Repeat for ALL ${expectedPages.length} pages)
]

3. **Image Mapping**: You must use the EXACT filenames provided below for the [REF_IMG_N] mapping.
4. **Character Naming**: ALWAYS use the Character Name defined below in the storyboard.

Scenario:
${input.scenario}

Reference Character Images (ID Mapping):
${input.characterImages.map((img, i) => `ID: [REF_IMG_${i+1}] => Use Filename: "${img.name}"`).join('\n')}
`;

  const parts: any[] = [{ text: promptText }];
  
  if (input.characterImages && input.characterImages.length > 0) {
    input.characterImages.forEach((img, i) => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64
        }
      });
      parts.push({ text: `[Attachment ${i + 1}: ${img.name}]` });
    });
  }

  let lastError: any;

  // モデルフォールバックループ (Main Generation)
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { role: "user", parts: parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 65536,
          // thinkingConfig removed to improve stability
        },
      });

      let text = response.text || "";
      
      // Clean up markdown
      if (text.startsWith('```')) {
          text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Extract JSON part if extra text exists
      const startIdx = text.indexOf('[');
      const endIdx = text.lastIndexOf(']');
      
      if (startIdx !== -1 && endIdx !== -1) {
          text = text.substring(startIdx, endIdx + 1);
      } else if (startIdx !== -1) {
          text = text.substring(startIdx);
      }

      let json;
      try {
          json = JSON.parse(text);
      } catch (e) {
          console.warn("Initial JSON parse failed. Attempting to repair truncated JSON...");
          json = repairTruncatedJson(text);
          
          if (!json) {
              console.error("JSON Parse Error. Raw text length:", text.length);
              throw new Error(`The AI generation was interrupted or produced invalid JSON.`);
          }
      }
      
      // Verify length check
      if (Array.isArray(json) && json.length !== expectedPages.length) {
          console.warn(`Generated ${json.length} pages, but expected ${expectedPages.length}.`);
      }

      let rows: CsvRow[] = json.map((item: any) => ({
        pageNumber: item.pageNumber,
        template: item.template,
        prompt: item.prompt
      }));

      // --- SORTING LOGIC ---
      rows = rows.sort((a, b) => {
        const isCoverA = a.pageNumber.toLowerCase().includes('cover') || a.pageNumber === '表紙';
        const isCoverB = b.pageNumber.toLowerCase().includes('cover') || b.pageNumber === '表紙';

        if (isCoverA && !isCoverB) return -1;
        if (!isCoverA && isCoverB) return 1;
        if (isCoverA && isCoverB) return 0;

        const numA = parseInt(a.pageNumber.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.pageNumber.replace(/\D/g, '')) || 0;

        return numA - numB;
      });

      const header = "Page,Template,Prompt";
      const csvLines = rows.map(r => {
        const promptSafe = r.prompt.replace(/"/g, '""');
        return `"${r.pageNumber}","${r.template}","${promptSafe}"`;
      });

      // 成功したら返す
      return {
        csvString: [header, ...csvLines].join('\n'),
        rows
      };

    } catch (error: any) {
      console.warn(`Generation failed with ${modelName}:`, error);
      lastError = error;
      // 次のモデルへ (Continue)
      continue;
    }
  }

  // 全て失敗した場合
  console.error("Gemini API Error (All models failed):", lastError);
  if (lastError?.message?.includes('400')) {
      throw new Error("API Error (400): リクエストが不正です。");
  }
  throw new Error(lastError?.message || "生成に失敗しました (Gemini 3.0 & 2.5の両方でエラー)。");
};