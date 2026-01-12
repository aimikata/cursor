
import { GoogleGenAI, Type } from "@google/genai";
import type { Correction } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

interface ProofreadResponse {
  corrections: Correction[];
  originalFullText: string;
}

// Helper function to convert File to a GenerativePart
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export async function proofreadImageText(imageFile: File): Promise<ProofreadResponse> {
  const imagePart = await fileToGenerativePart(imageFile);

  // Extremely lenient instruction focusing only on typos
  const systemInstruction = `You are a very lenient proofreader for English text in manga/comics.
Your ONLY job is to fix objective spelling errors (typos).

*** GOLDEN RULE ***
If the text is understandable, DO NOT CHANGE IT. Even if the grammar is wrong.

*** GUIDELINES ***
1. IGNORE grammatical errors (e.g., "He go to school" is OK because it's understandable).
2. IGNORE awkward phrasing or non-native expressions.
3. IGNORE punctuation errors.
4. IGNORE capitalization errors.
5. ACCEPT all slang, internet speak, and casual shortenings (e.g., "gonna", "wanna", "cause", "ain't").
6. ONLY FIX clear spelling mistakes (e.g., "beautifull" -> "beautiful", "thier" -> "their", "helo" -> "hello").
7. ONLY FIX meaningless gibberish.

If you are 1% unsure if it's an error, assume it is stylistic/creative and KEEP ORIGINAL.

FORMATTING:
- Maintain natural line breaks (\\n) for speech bubbles.
- Do not merge lines into a single long string.`;

  const userPrompt = `Analyze the comic page image.
1. Extract English text from speech bubbles.
2. Apply the STRICTLY LENIENT proofreading rules (fix typos only).
3. Output JSON array of objects with "original" and "corrected" keys.

- "original": Text exactly as seen in the image (preserve line breaks).
- "corrected":
    - If understandable: SAME AS ORIGINAL.
    - If typo found: Fixed text with natural line breaks (\\n).

Return only the JSON array.`;
  
  const contents = {
      parts: [
          { text: userPrompt },
          imagePart,
      ]
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                  original: { type: Type.STRING },
                  corrected: { type: Type.STRING },
              },
              required: ["original", "corrected"],
            }
        }
      },
    });

    const jsonText = response.text.replace(/```json\n?|\n?```/g, '');
    const corrections: Correction[] = JSON.parse(jsonText);
    
    if (!Array.isArray(corrections) || !corrections.every(c => typeof c.original === 'string' && typeof c.corrected === 'string')) {
      throw new Error("Invalid JSON structure from AI response.");
    }

    const originalFullText = corrections.map(c => c.original).join('\n\n');

    return { corrections, originalFullText };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get proofreading suggestions from AI.");
  }
}
