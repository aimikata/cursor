import { GoogleGenAI } from "@google/genai";
import { MangaPage, CharacterImage } from '../types';
import { SYSTEM_INSTRUCTION, MODEL_PRIMARY, MODEL_FALLBACK } from '../constants';
import { extractBracketContents, findBestMatchingImage } from '../utils/characterUtils';

// --- Helper Functions ---

function cleanBase64(data: string): string {
  return data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
}

function getMimeType(data: string): string {
  let match = data.match(/^data:(image\/[a-zA-Z]+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

function sanitizeApiKey(key: string): string {
  if (!key) return "";
  return key.replace(/[^\x00-\x7F]/g, "").trim();
}

/**
 * Executes a generation function with fallback logic.
 */
async function generateWithFallback(
  generateFn: (model: string) => Promise<any>
): Promise<any> {
  try {
    console.log(`Attempting generation with ${MODEL_PRIMARY}...`);
    return await generateFn(MODEL_PRIMARY);
  } catch (error: any) {
    console.warn(`${MODEL_PRIMARY} failed:`, error);
    
    console.log(`Falling back to ${MODEL_FALLBACK}...`);
    try {
      return await generateFn(MODEL_FALLBACK);
    } catch (fallbackError: any) {
      console.error(`${MODEL_FALLBACK} failed:`, fallbackError);
      throw new Error(`Generation failed. Primary: ${error.message}. Fallback: ${fallbackError.message}`);
    }
  }
}

/**
 * Core generation logic decoupled from the export.
 */
async function executeGeneration(ai: GoogleGenAI, parts: any[], model: string): Promise<string> {
  let response = await ai.models.generateContent({
    model: model,
    contents: { parts: parts },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      imageConfig: {
        aspectRatio: '9:16'
      }
    }
  });

  let candidates = response.candidates;
  if (candidates && candidates.length > 0) {
    let contentParts = candidates[0].content.parts;
    let textResponse = "";
    
    // Using simple for loop to avoid const/let scope issues in some environments
    if (contentParts) {
      for (let i = 0; i < contentParts.length; i++) {
        let part = contentParts[i];
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
        if (part.text) {
          textResponse += part.text;
        }
      }
    }
    
    if (textResponse) {
      throw new Error(`Model returned text instead of image: "${textResponse.slice(0, 200)}..."`);
    }
  }
  
  if (candidates && candidates[0]?.finishReason) {
    throw new Error(`Generation stopped. Reason: ${candidates[0].finishReason}`);
  }

  throw new Error("No image generated (Empty response).");
}

// --- Exported Functions ---

export async function generatePageImage(
  page: MangaPage,
  characters: CharacterImage[],
  apiKey: string
): Promise<string> {
  let cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) {
    throw new Error("API Key is missing or invalid (contains non-ASCII characters)");
  }

  let ai = new GoogleGenAI({ apiKey: cleanKey });

  // 1. Identify characters
  let bracketContents = extractBracketContents(page.prompt);
  let referencedCharacters: CharacterImage[] = [];
  
  for (let i = 0; i < bracketContents.length; i++) {
    let rawContent = bracketContents[i];
    let match = findBestMatchingImage(rawContent, characters);
    if (match) {
      // Check for duplicates
      let exists = referencedCharacters.some((c) => c.name === match.name);
      if (!exists) {
        referencedCharacters.push(match);
      }
    }
  }

  // 2. Build parts
  let parts: any[] = [];

  if (referencedCharacters.length > 0) {
    parts.push({ text: "Reference Characters (Strictly adhere to these visual designs):" });
    for (let j = 0; j < referencedCharacters.length; j++) {
      let char = referencedCharacters[j];
      parts.push({
        inlineData: {
          mimeType: char.mimeType,
          data: cleanBase64(char.data)
        }
      });
      parts.push({ text: `Filename: ${char.name}` });
    }
    parts.push({ text: "\n--- End References ---\n" });
  }

  let promptText = `\n◆【Panel_Layout】: ${page.template}\n${page.prompt}`;

  // Special handling for cover pages
  if (page.template && page.template.toLowerCase().includes('cover')) {
    promptText += `\n\n◆【CRITICAL_COVER_INSTRUCTION】: 
      1. This is a manga COVER PAGE. 
      2. Do NOT use speech bubbles. 
      3. RENDER THE TITLE TEXT (found in the prompt) AS A PROFESSIONAL, DECORATIVE MANGA LOGO. 
      4. Integrate the text typography artistically into the illustration/background.`;
  }

  parts.push({ text: promptText });

  return await generateWithFallback((model) => executeGeneration(ai, parts, model));
}

export async function editPageImage(
  originalImageBase64: string,
  prompt: string,
  apiKey: string
): Promise<string> {
  let cleanKey = sanitizeApiKey(apiKey);
  if (!cleanKey) throw new Error("API Key is missing or invalid");

  let ai = new GoogleGenAI({ apiKey: cleanKey });

  let parts = [
    {
      inlineData: {
        mimeType: getMimeType(originalImageBase64),
        data: cleanBase64(originalImageBase64)
      }
    },
    {
      text: prompt
    }
  ];

  return await generateWithFallback((model) => executeGeneration(ai, parts, model));
}