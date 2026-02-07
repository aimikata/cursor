
import { GoogleGenAI } from "@google/genai";
import { MangaPage, CharacterImage } from '../types';
import { SYSTEM_INSTRUCTION, MODELS } from '../constants';
import { extractBracketContents, findBestMatchingImage, getPromptMapping } from '../utils/characterUtils';

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
        // 指定可能: '1:1','2:3','3:2','3:4','4:3','4:5','5:4','9:16','16:9','21:9'
        aspectRatio: '2:3'
      }
    }
  });

  let candidates = response.candidates;
  if (candidates && candidates.length > 0) {
    let contentParts = candidates[0].content.parts;
    let textResponse = "";
    
    if (contentParts) {
      for (let part of contentParts) {
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

  let promptMapping = getPromptMapping(page.prompt);
  let bracketContents = extractBracketContents(page.prompt);
  let referencedCharacters: CharacterImage[] = [];
  
  for (let rawContent of bracketContents) {
    let match = findBestMatchingImage(rawContent, characters, promptMapping);
    // Ensure only unique characters are added
    if (match && !referencedCharacters.some(c => c.name === match!.name)) {
      referencedCharacters.push(match);
    }
  }

  let parts: any[] = [];

  if (referencedCharacters.length > 0) {
    parts.push({ text: "### START CHARACTER VISUAL DNA REGISTRY ###" });
    parts.push({ text: "COMMAND: You MUST maintain 100% visual consistency with the following character DNA profiles. This is a MASTER REFERENCE." });
    for (let char of referencedCharacters) {
      // Find all IDs in the prompt that map to this character image
      let associatedIds = Object.entries(promptMapping)
        .filter(([, filename]) => filename === char.name)
        .map(([id]) => `[Ref: ${id}]`)
        .join(", ");
      
      parts.push({ text: `\n[CHARACTER_DNA_ANCHOR: "${char.name}"] ${associatedIds ? `(Referenced as: ${associatedIds})` : ''}` });
      
      // Extract description specifically from prompt lines associated with this character
      let characterSpecificDescription = page.prompt.split('\n')
        .filter(line => associatedIds.split(',').some(idRef => line.includes(idRef.replace('[Ref: ', '[').replace(']', '')))) // Match lines containing any of the associated IDs
        .map(line => {
            // Further refine to get description after character name/ref, before next bracket or marker
            let descMatch = line.match(/(?:[\]］])\s*[:：]?\s*([^◆\[\n\r]+)/); // Look for text right after a bracket
            if (descMatch && descMatch[1]) {
              return descMatch[1].trim();
            }
            return '';
        })
        .filter(Boolean) // Remove empty strings
        .join('; '); // Join multiple descriptions if found on different lines
      
      parts.push({ text: `Visual Manifest for "${char.name}": ${characterSpecificDescription || 'No explicit visual description found. Refer to image DNA.'}` }); 
      parts.push({
        inlineData: {
          mimeType: char.mimeType,
          data: cleanBase64(char.data)
        }
      });
    }
    parts.push({ text: "\n### END CHARACTER VISUAL DNA REGISTRY. ABSOLUTELY DO NOT DEVIATE. ###\n\n" });
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
    { text: `### [REFINEMENT_REQUEST] ###\nInstruction: ${prompt}\n\nMaintain character consistency at all costs.` }
  ];

  return await generateWithFallback(modelId, (m) => executeGeneration(ai, parts, m));
}
