import { WorldviewReport } from "../types";

/**
 * 世界観レポートのJSON文字列を安全にパース
 * エラーが発生しても部分的な情報を返す
 */
export function parseWorldviewReport(jsonText: string): {
  success: boolean;
  report?: WorldviewReport;
  error?: string;
  partialData?: Partial<WorldviewReport>;
} {
  if (!jsonText || !jsonText.trim()) {
    return {
      success: false,
      error: "入力が空です。"
    };
  }
  
  try {
    // JSONとしてパースを試みる
    const parsed = JSON.parse(jsonText);
    
    // 基本的な構造チェック
    if (typeof parsed !== 'object' || parsed === null) {
      return {
        success: false,
        error: "有効なJSONオブジェクトではありません。",
        partialData: { seriesTitle: String(parsed) }
      };
    }
    
    // 世界観レポートの構造に合わせて抽出
    const report: WorldviewReport = {};
    
    // タイトルを抽出（複数の可能性のあるフィールドから）
    report.seriesTitle = parsed.seriesTitle 
      || parsed.title 
      || parsed.proposal?.title
      || parsed.SERIES_TITLE
      || '';
    
    // 巻情報を抽出
    if (parsed.volumes && Array.isArray(parsed.volumes)) {
      report.volumes = parsed.volumes.map((v: any) => ({
        volumeNumber: v.volumeNumber || 0,
        title: v.title || '',
        summary: v.summary || ''
      }));
    }
    
    // 世界観設定を抽出
    if (parsed.worldview) {
      report.worldview = {
        coreRule: parsed.worldview.coreRule ? {
          name: parsed.worldview.coreRule.name || '',
          merit: parsed.worldview.coreRule.merit || '',
          demerit: parsed.worldview.coreRule.demerit || ''
        } : undefined,
        keyLocations: parsed.worldview.keyLocations || []
      };
    }
    
    // 主人公情報を抽出
    if (parsed.protagonist) {
      report.protagonist = {
        name: parsed.protagonist.name || '',
        visualTags: parsed.protagonist.visualTags || ''
      };
    }
    
    // アートスタイルと背景タグ
    report.artStyleTags = parsed.artStyleTags || '';
    report.backgroundTags = parsed.backgroundTags || '';
    
    // キャラクター画像を抽出（base64データ）
    if (parsed.characterImages && Array.isArray(parsed.characterImages)) {
      report.characterImages = parsed.characterImages.map((img: any) => ({
        characterName: img.characterName || img.name || '',
        imageData: img.imageData || img.data || ''
      })).filter((img: any) => img.characterName && img.imageData);
    }
    
    return {
      success: true,
      report
    };
    
  } catch (error: any) {
    // JSONパースエラーの場合、テキストから部分的な情報を抽出
    const partialData: Partial<WorldviewReport> = {};
    
    // タイトルらしき文字列を探す（"title": "..." や TITLE: ... など）
    const titleMatch = jsonText.match(/(?:title|TITLE|seriesTitle|シリーズタイトル)[\s:：]*["']?([^"'\n]+)["']?/i);
    if (titleMatch) {
      partialData.seriesTitle = titleMatch[1].trim();
    }
    
    return {
      success: false,
      error: `JSONのパースに失敗しました: ${error.message}`,
      partialData: Object.keys(partialData).length > 0 ? partialData : undefined
    };
  }
}

/**
 * テキストから世界観レポートの情報を抽出（JSONでない場合でも）
 */
export function extractWorldviewInfo(text: string): Partial<WorldviewReport> {
  const info: Partial<WorldviewReport> = {};
  
  // タイトル抽出
  const titlePatterns = [
    /(?:タイトル|TITLE|title|シリーズタイトル)[\s:：]*["']?([^"'\n]+)["']?/i,
    /TITLE:\s*([^\n]+)/i,
    /seriesTitle:\s*["']?([^"'\n]+)["']?/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      info.seriesTitle = match[1].trim();
      break;
    }
  }
  
  return info;
}
