import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CoverInput, WorldviewReport, CharacterImage } from "../types";

const IMAGE_MODEL = 'gemini-2.5-flash-image';

/**
 * 世界観レポートからジャンルを自動判定
 */
function detectGenreFromReport(report: WorldviewReport | undefined): 'practical' | 'story' {
  if (!report) return 'story';
  
  // 実用書のキーワードをチェック
  const practicalKeywords = ['学習', '解説', 'ビジネス', 'ノウハウ', '実用', '入門', 'マネー', '経済', 'AI', 'テクノロジー'];
  const title = report.seriesTitle || '';
  const summary = report.volumes?.[0]?.summary || '';
  const coreRule = report.worldview?.coreRule?.name || '';
  
  const combinedText = `${title} ${summary} ${coreRule}`.toLowerCase();
  
  if (practicalKeywords.some(keyword => combinedText.includes(keyword.toLowerCase()))) {
    return 'practical';
  }
  
  return 'story';
}

/**
 * 世界観レポートから視覚的なコンセプトを抽出
 */
function extractVisualConcept(report: WorldviewReport | undefined, genre: 'practical' | 'story'): string {
  if (!report) return '';
  
  const parts: string[] = [];
  
  // タイトル
  if (report.seriesTitle) {
    parts.push(`Title: ${report.seriesTitle}`);
  }
  
  // 世界観の核心ルール
  if (report.worldview?.coreRule?.name) {
    parts.push(`Core Concept: ${report.worldview.coreRule.name}`);
  }
  
  // 主要な場所
  if (report.worldview?.keyLocations && report.worldview.keyLocations.length > 0) {
    const location = report.worldview.keyLocations[0];
    if (location.name) {
      parts.push(`Key Location: ${location.name}`);
    }
  }
  
  // 主人公の視覚的特徴
  if (report.protagonist?.visualTags) {
    parts.push(`Character Visual: ${report.protagonist.visualTags}`);
  }
  
  // アートスタイル
  if (report.artStyleTags) {
    parts.push(`Art Style: ${report.artStyleTags}`);
  }
  
  // 背景タグ
  if (report.backgroundTags) {
    parts.push(`Background: ${report.backgroundTags}`);
  }
  
  return parts.join('. ');
}

/**
 * 表紙生成用のプロンプトを構築
 */
function buildCoverPrompt(input: CoverInput): string {
  const genre = input.genre === 'auto' 
    ? detectGenreFromReport(input.worldviewReport)
    : input.genre;
  
  const visualConcept = input.worldviewReport 
    ? extractVisualConcept(input.worldviewReport, genre)
    : input.customConcept || '';
  
  // ジャンルに応じたデザイン指示
  const genreInstructions = genre === 'practical'
    ? `Layout: "Title Dominant" (Title occupies top 40% or Center). Colors: Navy (#000080) & Gold (Trust), or Orange/White (Energy). Subject: Simple symbolic object (Speed, Money, Graph) supporting the text.`
    : `Layout: "Character Focus". Subject: Character with Eye Contact (Looking at the camera). Colors: Genre-specific (Pink for Romance, Red/Black for Battle).`;
  
  const fontStyle = genre === 'practical'
    ? 'Bold, Massive Sans-serif (Impact style)'
    : 'Elegant Serif or Cinematic logo';
  
  const prompt = `A vertical 9:16 book cover for a ${genre === 'practical' ? 'Business/Practical' : 'Story/Entertainment'} book titled '${input.title}'. ${visualConcept ? `${visualConcept}. ` : ''}${genreInstructions} Text '${input.title}' is written in ${fontStyle} in the center/top. High contrast, 8k resolution, commercial masterpiece. --no typos, --no vertical text, --no messy background, --no subtitles, --no blurry text, --no distorted faces, --no horizontal layout`;
  
  return prompt;
}

/**
 * base64データからプレフィックスを除去
 */
function cleanBase64(data: string): string {
  // data:image/png;base64, などのプレフィックスを除去
  const base64Match = data.match(/base64,(.+)$/);
  return base64Match ? base64Match[1] : data.replace(/^data:[^;]+;base64,/, '');
}

/**
 * 表紙画像を生成
 */
export async function generateCoverImage(
  input: CoverInput,
  apiKey: string
): Promise<{ imageData: string; prompt: string }> {
  if (!apiKey) {
    throw new Error("APIキーが設定されていません。");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  // プロンプトを構築
  const coverPrompt = buildCoverPrompt(input);
  
  // パーツを構築（キャラクター画像を含む）
  const parts: any[] = [];
  
  // キャラクター画像を参照として追加
  if (input.characterImages && input.characterImages.length > 0) {
    parts.push({ text: "### START CHARACTER REFERENCE IMAGES (Use these as visual reference for the cover design) ###" });
    for (const charImage of input.characterImages) {
      parts.push({ text: `Character: ${charImage.name}` });
      parts.push({
        inlineData: {
          mimeType: charImage.mimeType || 'image/png',
          data: cleanBase64(charImage.data)
        }
      });
    }
    parts.push({ text: "### END CHARACTER REFERENCE IMAGES ###\n\n" });
  }
  
  // 世界観レポートからキャラクター画像を取得
  if (input.worldviewReport?.characterImages && input.worldviewReport.characterImages.length > 0) {
    if (parts.length === 0) {
      parts.push({ text: "### START CHARACTER REFERENCE IMAGES (From Worldview Report) ###" });
    }
    for (const charImage of input.worldviewReport.characterImages) {
      parts.push({ text: `Character: ${charImage.characterName}` });
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64(charImage.imageData)
        }
      });
    }
    if (parts[parts.length - 1].text?.includes('END')) {
      // 既にENDがある場合は置き換え
      parts[parts.length - 1] = { text: "### END CHARACTER REFERENCE IMAGES ###\n\n" };
    } else {
      parts.push({ text: "### END CHARACTER REFERENCE IMAGES ###\n\n" });
    }
  }
  
  // Gemini 3.0の指示プロンプト
  const systemPrompt = `Role:
You are an expert **AI Book Cover Designer** powered by Imagen 3.
Your Goal: **DIRECTLY GENERATE** a high-quality Book Cover Image based on the user's input.
**DO NOT** output a text prompt description. **EXECUTE THE IMAGE GENERATION** immediately.

# CANVAS SPECIFICATIONS (Strict)
*   **Aspect Ratio**: **Vertical (9:16)**.
    *   *Note*: This ratio (approx 1:1.77) is the closest standard AI format to the Kindle 1:1.6 requirement and works perfectly for smartphone thumbnails.
*   **Text Rendering**: You MUST render the **Main Title** string directly onto the image.

# DESIGN LOGIC: "The 0.2 Second Rule"
To ensure a High Click-Through Rate (CTR) on Amazon, apply these rules:

1.  **TEXT RENDERING (The "HERO")**
    *   **Main Title Only**: Render the Main Title clearly. **DO NOT** render subtitles (it causes clutter on thumbnails).
    *   **Typography**: Use a font style that matches the genre.
        *   *Business*: Bold, Massive Sans-serif (Impact style).
        *   *Story*: Elegant Serif or Cinematic logo.
    *   **Legibility**: Apply **High Contrast** or **Drop Shadow** so text is readable against any background.

2.  **COMPOSITION & COLOR**
    *   **Practical/Business**:
        *   Layout: **"Title Dominant"** (Title occupies top 40% or Center).
        *   Colors: Navy (#000080) & Gold (Trust), or Orange/White (Energy).
        *   Subject: Simple symbolic object (Speed, Money, Graph) supporting the text.
    *   **Story/Entertainment**:
        *   Layout: **"Character Focus"**.
        *   Subject: Character with **Eye Contact** (Looking at the camera).
        *   Colors: Genre-specific (Pink for Romance, Red/Black for Battle).

# INSTRUCTION TO THE MODEL
When the user provides the book info, **IMMEDIATELY generate the image** using the internal tool with the following prompt structure:
${coverPrompt}

# NEGATIVE CONSTRAINTS
--no typos, --no vertical text (unless specified), --no messy background, --no subtitles, --no blurry text, --no distorted faces, --no horizontal layout

# USER INPUT:
Title: ${input.title}
${input.worldviewReport ? `Worldview Report: ${JSON.stringify(input.worldviewReport, null, 2)}` : ''}
${input.customConcept ? `Custom Concept: ${input.customConcept}` : ''}
${input.characterImages && input.characterImages.length > 0 ? `\nCharacter Reference Images: ${input.characterImages.length} image(s) attached. Use these as visual reference for the cover design.` : ''}`;

  // テキストプロンプトを追加
  parts.push({ text: systemPrompt });

  try {
    // Gemini 2.5 Flash Imageモデルを使用して画像生成
    // 注意: 実際の画像生成はgemini-2.5-flash-imageを使用
    // Gemini 3.0の画像生成機能が利用可能になった場合は、モデル名を変更してください
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: parts, // キャラクター画像とプロンプトを含む
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });
    
    // 画像データを抽出
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("画像生成に失敗しました。レスポンスが空です。");
    }
    
    const candidate = candidates[0];
    if (!candidate.content?.parts) {
      throw new Error("画像データが見つかりませんでした。");
    }
    
    let imageData = '';
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
    
    if (!imageData) {
      throw new Error("画像データの抽出に失敗しました。");
    }
    
    return {
      imageData,
      prompt: coverPrompt
    };
  } catch (error: any) {
    console.error("Cover generation error:", error);
    throw new Error(`表紙生成に失敗しました: ${error.message || '不明なエラー'}`);
  }
}
