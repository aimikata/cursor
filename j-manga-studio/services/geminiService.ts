
import { GoogleGenAI } from "@google/genai";
import { MangaPage, CharacterImage } from '../types';
import { SYSTEM_INSTRUCTION, MODELS } from '../constants';
import { extractBracketContents, findBestMatchingImage } from '../utils/characterUtils';

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

async function generateWithFallback(
  preferredModel: string,
  generateFn: (model: string) => Promise<any>
): Promise<any> {
  try {
    return await generateFn(preferredModel);
  } catch (error: any) {
    if (preferredModel === MODELS.HIGH_QUALITY) {
      try {
        return await generateFn(MODELS.FAST);
      } catch (fallbackError: any) {
        throw new Error(`Generation failed. Primary: ${error.message}. Fallback: ${fallbackError.message}`);
      }
    } else {
      throw error;
    }
  }
}

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
      throw new Error(`Model returned text: "${textResponse.slice(0, 200)}..."`);
    }
  }
  
  if (candidates && candidates[0]?.finishReason) {
    throw new Error(`Generation stopped. Reason: ${candidates[0].finishReason}`);
  }

  throw new Error("No image generated.");
}

export async function generatePageImage(
  page: MangaPage,
  characters: CharacterImage[],
  apiKey: string,
  modelId: string = MODELS.HIGH_QUALITY
): Promise<string> {
  let cleanKey = sanitizeApiKey(apiKey);
  let ai = new GoogleGenAI({ apiKey: cleanKey });

  let bracketContents = extractBracketContents(page.prompt);
  let referencedCharacters: CharacterImage[] = [];
  
  for (let i = 0; i < bracketContents.length; i++) {
    let rawContent = bracketContents[i];
    let match = findBestMatchingImage(rawContent, characters);
    if (match && !referencedCharacters.some(c => c.name === match!.name)) {
      referencedCharacters.push(match);
    }
  }

  let parts: any[] = [];

  if (referencedCharacters.length > 0) {
    parts.push({ text: "### START CHARACTER VISUAL DATA (Strictly follow these designs for matching names) ###" });
    for (let j = 0; j < referencedCharacters.length; j++) {
      let char = referencedCharacters[j];
      parts.push({ text: `Target Character Filename: "${char.name}"` });
      parts.push({
        inlineData: {
          mimeType: char.mimeType,
          data: cleanBase64(char.data)
        }
      });
    }
    parts.push({ text: "### END CHARACTER VISUAL DATA ###\n\n" });
  }

  let promptText = `◆【Panel_Layout】: ${page.template}\n${page.prompt}`;

  if (page.template && page.template.toLowerCase().includes('cover')) {
    promptText += `\n\n◆【COVER_INSTRUCTION】: RENDER TITLE AS DECORATIVE LOGO. NO BUBBLES.`;
  }

  parts.push({ text: promptText });

  return await generateWithFallback(modelId, (m) => executeGeneration(ai, parts, m));
}

export async function editPageImage(
  originalImageBase64: string,
  prompt: string,
  apiKey: string,
  modelId: string = MODELS.HIGH_QUALITY
): Promise<string> {
  let cleanKey = sanitizeApiKey(apiKey);
  let ai = new GoogleGenAI({ apiKey: cleanKey });

  let parts = [
    {
      inlineData: {
        mimeType: getMimeType(originalImageBase64),
        data: cleanBase64(originalImageBase64)
      }
    },
    { text: prompt }
  ];

  return await generateWithFallback(modelId, (m) => executeGeneration(ai, parts, m));
}
