import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const IMAGE_MODEL = 'gemini-2.5-flash-image';

// 429エラー対策の再試行
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 2000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error.message?.includes('429') || error.status === 429) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Quota exceeded (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function cleanBase64(data: string): string {
  const base64Match = data.match(/base64,(.+)$/);
  return base64Match ? base64Match[1] : data.replace(/^data:[^;]+;base64,/, '');
}

function detectGenre(worldviewReport: any): 'practical' | 'story' {
  if (!worldviewReport) return 'story';
  
  const practicalKeywords = ['学習', '解説', 'ビジネス', 'ノウハウ', '実用', '入門', 'マネー', '経済', 'AI', 'テクノロジー'];
  const title = worldviewReport.seriesTitle || '';
  const summary = worldviewReport.volumes?.[0]?.summary || '';
  const coreRule = worldviewReport.worldview?.coreRule?.name || '';
  
  const combinedText = `${title} ${summary} ${coreRule}`.toLowerCase();
  
  if (practicalKeywords.some(keyword => combinedText.includes(keyword.toLowerCase()))) {
    return 'practical';
  }
  
  return 'story';
}

function extractVisualConcept(worldviewReport: any, genre: 'practical' | 'story'): string {
  if (!worldviewReport) return '';
  
  const parts: string[] = [];
  
  if (worldviewReport.seriesTitle) {
    parts.push(`Title: ${worldviewReport.seriesTitle}`);
  }
  
  if (worldviewReport.worldview?.coreRule?.name) {
    parts.push(`Core Concept: ${worldviewReport.worldview.coreRule.name}`);
  }
  
  if (worldviewReport.worldview?.keyLocations?.[0]?.name) {
    parts.push(`Key Location: ${worldviewReport.worldview.keyLocations[0].name}`);
  }
  
  if (worldviewReport.protagonist?.visualTags) {
    parts.push(`Character Visual: ${worldviewReport.protagonist.visualTags}`);
  }
  
  if (worldviewReport.artStyleTags) {
    parts.push(`Art Style: ${worldviewReport.artStyleTags}`);
  }
  
  if (worldviewReport.backgroundTags) {
    parts.push(`Background: ${worldviewReport.backgroundTags}`);
  }
  
  return parts.join('. ');
}

function buildCoverPrompt(input: {
  title: string;
  genre: 'practical' | 'story' | 'auto';
  worldviewReport?: any;
  customConcept?: string;
}): string {
  const genre = input.genre === 'auto' 
    ? detectGenre(input.worldviewReport)
    : input.genre;
  
  const visualConcept = input.worldviewReport 
    ? extractVisualConcept(input.worldviewReport, genre)
    : input.customConcept || '';
  
  const genreInstructions = genre === 'practical'
    ? `Layout: "Title Dominant" (Title occupies top 40% or Center). Colors: Navy (#000080) & Gold (Trust), or Orange/White (Energy). Subject: Simple symbolic object (Speed, Money, Graph) supporting the text.`
    : `Layout: "Character Focus". Subject: Character with Eye Contact (Looking at the camera). Colors: Genre-specific (Pink for Romance, Red/Black for Battle).`;
  
  const fontStyle = genre === 'practical'
    ? 'Bold, Massive Sans-serif (Impact style)'
    : 'Elegant Serif or Cinematic logo';
  
  return `A vertical 9:16 book cover for a ${genre === 'practical' ? 'Business/Practical' : 'Story/Entertainment'} book titled '${input.title}'. ${visualConcept ? `${visualConcept}. ` : ''}${genreInstructions} Text '${input.title}' is written in ${fontStyle} in the center/top. High contrast, 8k resolution, commercial masterpiece. --no typos, --no vertical text, --no messy background, --no subtitles, --no blurry text, --no distorted faces, --no horizontal layout`;
}

export async function POST(req: NextRequest) {
  try {
    const { title, genre, worldviewReport, customConcept, apiKey } = await req.json();
    
    const geminiApiKey = apiKey || process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please provide an API key in the request or set it as an environment variable.' },
        { status: 500 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'タイトルを入力してください。' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // プロンプトを構築
    const coverPrompt = buildCoverPrompt({
      title: title.trim(),
      genre: genre || 'auto',
      worldviewReport,
      customConcept
    });
    
    // パーツを構築（キャラクター画像を含む）
    const parts: any[] = [];
    
    // 世界観レポートからキャラクター画像を取得
    if (worldviewReport?.characterImages && worldviewReport.characterImages.length > 0) {
      parts.push({ text: "### START CHARACTER REFERENCE IMAGES (Use these as visual reference for the cover design) ###" });
      for (const charImage of worldviewReport.characterImages) {
        parts.push({ text: `Character: ${charImage.characterName}` });
        parts.push({
          inlineData: {
            mimeType: 'image/png',
            data: cleanBase64(charImage.imageData)
          }
        });
      }
      parts.push({ text: "### END CHARACTER REFERENCE IMAGES ###\n\n" });
    }
    
    // テキストプロンプトを追加
    parts.push({ text: coverPrompt });

    const model = genAI.getGenerativeModel({ model: IMAGE_MODEL });
    
    const response = await fetchWithRetry(() =>
      model.generateContent({
        contents: [{ role: 'user', parts }],
      } as any)
    );

    const result = await response.response;
    
    // 画像データを抽出
    if (!result.candidates || result.candidates.length === 0) {
      throw new Error('画像生成に失敗しました。レスポンスが空です。');
    }
    
    const candidate = result.candidates[0];
    if (!candidate.content?.parts) {
      throw new Error('画像データが見つかりませんでした。');
    }
    
    let imageData = '';
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
    
    if (!imageData) {
      throw new Error('画像データの抽出に失敗しました。');
    }
    
    return NextResponse.json({
      imageData,
      prompt: coverPrompt
    });
  } catch (error: any) {
    console.error('Cover generation error:', error);
    return NextResponse.json(
      { error: `表紙生成に失敗しました: ${error.message || '不明なエラー'}` },
      { status: 500 }
    );
  }
}
