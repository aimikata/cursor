// 世界観レポートから取り込む情報の型定義
export interface WorldviewReport {
  seriesTitle?: string;
  volumes?: Array<{
    volumeNumber: number;
    title: string;
    summary?: string;
  }>;
  worldview?: {
    coreRule?: {
      name?: string;
      merit?: string;
      demerit?: string;
    };
    keyLocations?: Array<{
      name?: string;
      historicalBackground?: string;
      structuralFeatures?: string;
    }>;
  };
  protagonist?: {
    name?: string;
    visualTags?: string;
  };
  artStyleTags?: string;
  backgroundTags?: string;
  // キャラクター画像（base64データ）
  characterImages?: Array<{
    characterName: string;
    imageData: string; // base64 data URL
  }>;
}

// キャラクター画像
export interface CharacterImage {
  name: string;
  data: string; // base64 data URL
  mimeType: string;
}

// 表紙生成の入力データ
export interface CoverInput {
  title: string;
  genre: 'practical' | 'story' | 'auto';
  worldviewReport?: WorldviewReport;
  customConcept?: string;
  characterImages?: CharacterImage[]; // キャラクター画像を参照として使用
}

// 生成された表紙画像
export interface GeneratedCover {
  imageData: string; // base64
  prompt: string;
  timestamp: number;
}
