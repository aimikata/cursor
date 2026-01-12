import { GoogleGenAI, Type } from "@google/genai";
import { MangaInput, CsvRow, Genre } from "../types";
import { SYSTEM_INSTRUCTION, GENRES } from "../constants";

// 優先順位の高い順にモデルを定義
const MODELS_TO_TRY = ["gemini-3-pro-preview", "gemini-2.5-flash"];

/**
 * JSON修復ロジック
 */
const repairTruncatedJson = (jsonString: string): any[] | null => {
  let clean = jsonString.trim();
  clean = clean.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  
  try {
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // continue
  }
  
  if (clean.endsWith(',')) {
      clean = clean.slice(0, -1);
  }
  
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
    if (Array.isArray(parsed)) {
        return parsed;
    }
  } catch (e) {
    console.warn("JSON Repair Failed:", e);
  }

  return null;
};

export const analyzeScenario = async (
  scenario: string,
  worldSettings: string | undefined,
  apiKey?: string
): Promise<{ pageCount: number; genre: Genre }> => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error("APIキーが設定されていません。");
  }

  const ai = new GoogleGenAI({ apiKey: key });

  const prompt = `
You are a professional Business Manga Editor.
Analyze the following scenario text.

Task:
1. Determine the most appropriate Genre from this list: ${JSON.stringify(GENRES)}.
2. Estimate the appropriate Page Count required to create a "Business Comic" adaptation.

**CRITICAL RULE FOR PAGE COUNT**:
- **DO NOT SUMMARIZE**. The goal is to convey 100% of the content.
- If the text is dense, you need MORE pages to explain it thoroughly with emotional pacing.
- **Max panels per page is 4**. This means text density per page must be low.
- Recommendation formula: Approx 200-300 characters of scenario text per page.
- Minimum recommendation: 8 pages.
- Max limit: 50 pages.

Scenario:
${scenario}

World Settings:
${worldSettings || "None"}
`;

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

      let result;
      try {
        result = JSON.parse(response.text);
      } catch (e) {
        const text = response.text.replace(/```json|```/g, '').trim();
        result = JSON.parse(text);
      }

      let genre: Genre = 'ビジネス・自己啓発';
      if (result.genre && GENRES.includes(result.genre as Genre)) {
        genre = result.genre as Genre;
      }

      let pageCount = 8; // Default for business manga
      if (typeof result.pageCount === 'number') {
        pageCount = Math.max(1, Math.min(50, result.pageCount));
      }

      return { pageCount, genre };

    } catch (error: any) {
      lastError = error;
      continue;
    }
  }
  throw new Error(lastError?.message || "Analysis failed.");
};

export const generateMangaPlan = async (
  input: MangaInput,
  apiKey?: string
): Promise<{ csvString: string; rows: CsvRow[] }> => {
  const key = apiKey || process.env.API_KEY;

  if (!key) {
    throw new Error("APIキーが設定されていません。");
  }

  const ai = new GoogleGenAI({ apiKey: key });
  
  // Required pages list
  const pageList = Array.from({ length: input.pageCount }, (_, i) => `Page ${i + 1}`);
  const expectedPages = input.includeCover ? ["Cover", ...pageList] : pageList;
  
  // --- BUSINESS MANGA BLUEPRINT (Problem -> Solution -> Result) ---
  const blueprint = expectedPages.map((p, i) => {
    if (p === "Cover") {
        return `- "${p}": 【Book Cover】 Title "${input.title}". Dignified, trustworthy design for business section.`;
    }

    const pageNum = parseInt(p.replace("Page ", ""));
    const isSinglePage = input.pageCount === 1;

    // Page 1: Always Tobira/Hook
    if (pageNum === 1 && !isSinglePage) {
        return `- "${p}": 【Hook / The Problem】 **Template: T01_CHAPTER_COVER**. Show the protagonist's "Quiet Anxiety" or the "Messy Desk" state. Emotional engagement start. Title: "${input.chapterTitle || 'Chapter 1'}".`;
    }

    const totalContentPages = isSinglePage ? 1 : input.pageCount - 1;
    const currentContentIndex = isSinglePage ? 0 : pageNum - 2;
    const ratio = (currentContentIndex + 1) / totalContentPages;

    if (ratio <= 0.3) {
         return `- "${p}": 【Empathy/Struggle】 The protagonist tries but fails. Deepen the emotional reality of the problem. Stagnation.`;
    } else if (ratio <= 0.6) {
         return `- "${p}": 【The Solution/Theory】 **Template: T01_MENTOR**. The Mentor explains the core concept. Ensure ALL specific teaching points from the script are covered here.`;
    } else if (ratio <= 0.8) {
         return `- "${p}": 【Application/Practice】 The Protagonist applies the method. Show the specific actions taken.`;
    } else {
         return `- "${p}": 【The Change/Result】 Internal Satisfaction. The problem is resolved. Emotional release.`;
    }
  }).join("\n");

  const titleContext = `
Series Title: ${input.title}
Subtitle: ${input.subtitle || 'N/A'}
Catchphrase: ${input.catchphrase || 'N/A'}
Author: ${input.author || 'N/A'}
Chapter Title: ${input.chapterTitle || 'N/A'}
`;

  const promptText = `
Request Details:
- **MODE: BUSINESS COMIC ADAPTATION** (Target: 30-50s Business People)
${titleContext}
- Target Language: ${input.target}
- Genre: ${input.genre}
- **REQUIRED OUTPUT COUNT: ${expectedPages.length} PAGES (STRICT)**
- World Settings: ${input.worldSettings || "N/A"}

**CRITICAL INSTRUCTION: STRICT PAGE COUNT MATCHING**
1.  **You MUST output EXACTLY ${expectedPages.length} pages.**
2.  **ONE-TO-ONE MAPPING**: You must create exactly one JSON object for EACH item in the "PAGE ALLOCATION BLUEPRINT" below.
3.  **NO SKIPPING**: Do not summarize multiple blueprint steps into one page. Even if the content seems short, decompress the story with emotional reaction panels or atmospheric shots to fill the page.
4.  **NO MERGING**: Each "Page X" in the blueprint must have its own dedicated entry in the output array.
5.  **OUTPUT LENGTH CHECK**: Ensure the resulting JSON array has a length of ${expectedPages.length}.

**NARRATIVE ARC (THE "90% COMMUNICATION" STYLE)**:
1. **Quiet Anxiety**: Start with a realistic struggle (stagnation, mess, sighing).
2. **Dignified Mentor**: Introduce a guide who is calm, authoritative, and kind.
3. **The Logic**: Explain the solution clearly using text/diagrams (T01_MENTOR).
4. **The Shift**: Show the protagonist's internal relief and steady step forward.

**PAGE ALLOCATION BLUEPRINT (Execute ALL ${expectedPages.length} items)**:
${blueprint}

**OUTPUT FORMAT**:
Return a VALID JSON Array.
[
  { "pageNumber": "Cover", "template": "T01_COVER", "prompt": "..." },
  { "pageNumber": "Page 1", "template": "T01_CHAPTER_COVER", "prompt": "..." },
  ...
]

3. **Image Mapping**: Use EXACT filenames provided.
4. **Character Consistency**: Maintain the Mentor/Learner dynamic.

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

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { role: "user", parts: parts },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          maxOutputTokens: 65536,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pageNumber: { type: Type.STRING },
                template: { type: Type.STRING },
                prompt: { type: Type.STRING },
              },
              required: ["pageNumber", "template", "prompt"],
            },
          },
        },
      });

      let text = response.text || "";
      // Clean up markdown just in case the model wraps the JSON response
      text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

      let json: any[];
      try {
          json = JSON.parse(text);
      } catch (e) {
          console.warn("Strict parse failed, attempting repair", e);
          const repaired = repairTruncatedJson(text);
          if (!repaired) throw new Error("Invalid JSON output");
          json = repaired;
      }
      
      // --- PAGE COUNT ENFORCEMENT & FILLING MISSING PAGES ---
      // Create a map from the generated JSON for easy lookup
      const generatedMap = new Map<string, any>();
      if (Array.isArray(json)) {
          json.forEach((item: any) => {
              if (item && item.pageNumber) {
                  // Normalize key: remove spaces, lowercase (e.g., "Page 1" -> "page1")
                  const key = item.pageNumber.toString().toLowerCase().replace(/\s+/g, '');
                  generatedMap.set(key, item);
              }
          });
      }

      // Reconstruct rows strictly based on `expectedPages` to ensure no pages are missing
      const rows: CsvRow[] = expectedPages.map(pageName => {
          const key = pageName.toLowerCase().replace(/\s+/g, '');
          
          // 1. Try exact/normalized match
          let match = generatedMap.get(key);

          // 2. If not found, try to find a "close enough" match (e.g. "Page01" vs "Page1")
          if (!match) {
             // Simple fallback: look for numeric match
             const targetNum = parseInt(pageName.replace(/\D/g, ''));
             if (!isNaN(targetNum)) {
                 for (const [genKey, val] of generatedMap.entries()) {
                     const genNum = parseInt(genKey.replace(/\D/g, ''));
                     if (genNum === targetNum) {
                         match = val;
                         break;
                     }
                 }
             }
          }

          if (match) {
              return {
                  pageNumber: pageName, // Use the expected canonical name
                  template: match.template || "template1",
                  prompt: match.prompt || ""
              };
          } else {
              // 3. Fallback for missing pages (Fill with placeholder)
              console.warn(`Missing page detected: ${pageName}. Filling with placeholder.`);
              return {
                  pageNumber: pageName,
                  template: "T01_FULL",
                  prompt: `(⚠️ AI skipped this page generation. Please regenerate or edit manually.)\n\n[Context from Blueprint]\nThis page was intended for: ${pageName}`
              };
          }
      });

      const header = "Page,Template,Prompt";
      const csvLines = rows.map(r => {
        const promptSafe = r.prompt.replace(/"/g, '""');
        return `"${r.pageNumber}","${r.template}","${promptSafe}"`;
      });

      return {
        csvString: [header, ...csvLines].join('\n'),
        rows
      };

    } catch (error: any) {
      console.warn(`Generation failed with ${modelName}:`, error);
      lastError = error;
      continue;
    }
  }

  throw new Error(lastError?.message || "Generation failed.");
};
