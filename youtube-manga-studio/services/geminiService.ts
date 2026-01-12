import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CharacterProfile, DirectorOutput } from "../types";
import { BUBBLE_DEFINITIONS, SYSTEM_PROMPT_TEMPLATE, DIRECTOR_SYSTEM_PROMPT } from "../constants";

// Helper to remove data URL prefix for API
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1];
};

/**
 * Step 1: The Director (Flash)
 * Analyzes the scenario and outputs visual direction and dialogue.
 */
export const directScene = async (
  apiKey: string,
  charA: CharacterProfile,
  charB: CharacterProfile,
  scenario: string
): Promise<DirectorOutput> => {
  const ai = new GoogleGenAI({ apiKey });

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      visual_direction: { type: Type.STRING, description: "Detailed visual instruction for the image generator, specifically describing layout, composition, and acting." },
      bubble_type: { type: Type.STRING, description: "The type of speech bubble selected." },
      dialogue: { type: Type.STRING, description: "The dialogue text." }
    },
    required: ["visual_direction", "bubble_type", "dialogue"]
  };

  const prompt = `${DIRECTOR_SYSTEM_PROMPT}

[CHAR_A]: ${charA.name} (${charA.description})
[CHAR_B]: ${charB.name} (${charB.description})

## ユーザーのシーン概要
${scenario}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7 // A bit of creativity for the director
    }
  });

  const text = response.text;
  if (!text) throw new Error("Director failed to generate instructions.");
  
  return JSON.parse(text) as DirectorOutput;
};

/**
 * Step 2: The Artist (Pro Image Preview)
 * Generates the image based on the Director's output.
 */
export const generateMangaImage = async (
  apiKey: string,
  charA: CharacterProfile,
  charB: CharacterProfile,
  directorOutput: DirectorOutput
) => {
  const ai = new GoogleGenAI({ apiKey });

  // 1. Construct the Text Prompt
  let prompt = SYSTEM_PROMPT_TEMPLATE;
  const parts: any[] = [];

  // 2. Handle Character Images & Definitions
  let charIndex = 0;
  
  if (charA.imageData) {
    prompt += `\n* **[CHAR_A] (${charA.name}):** 添付画像${charIndex + 1}を参照してください。\n  (補足特徴: ${charA.description})`;
    parts.push({
      inlineData: {
        data: cleanBase64(charA.imageData),
        mimeType: charA.mimeType
      }
    });
    charIndex++;
  } else {
    prompt += `\n* **[CHAR_A] (${charA.name}):** ${charA.description} (画像なし)`;
  }

  if (charB.imageData) {
    prompt += `\n* **[CHAR_B] (${charB.name}):** 添付画像${charIndex + 1}を参照してください。\n  (補足特徴: ${charB.description})`;
    parts.push({
      inlineData: {
        data: cleanBase64(charB.imageData),
        mimeType: charB.mimeType
      }
    });
    charIndex++;
  } else {
     prompt += `\n* **[CHAR_B] (${charB.name}):** ${charB.description} (画像なし)`;
  }

  // 3. Scene & Bubble Instructions (From Director)
  prompt += `\n\n# 3. シーン描画指示\n${directorOutput.visual_direction}`;

  prompt += `\n\n# 4. 吹き出し・セリフ指示\n${BUBBLE_DEFINITIONS}`;
  prompt += `\n**今回の指定:**`;
  prompt += `\n- 吹き出し種類: ${directorOutput.bubble_type}`;
  prompt += `\n- セリフ内容: 「${directorOutput.dialogue}」`;
  prompt += `\n- 配置: 下部20%の余白を避け、上部80%内に配置してください。`;

  // Add the text prompt to parts
  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64Data = part.inlineData.data;
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${base64Data}`;
            }
        }
    }
    
    throw new Error("No image data found in response");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};