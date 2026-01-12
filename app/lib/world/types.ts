export type TargetMarket = 'japan' | 'english';

export interface Genre {
  id: string;
  name: string;
  styleDescription: string;
  artStylePrompt: string;
}

export interface WorldviewProposal {
  title: string;
  coreConcept: string;
  protagonistIdea: string;
  firstEpisodeHook: string;
  currentStatus?: string;
  unresolvedList?: string;
  progress?: string;
}

export interface WorldviewSetting {
  coreRule: {
    name: string;
    merit: string;
    demerit: string;
  };
  keyLocations: Array<{
    name: string;
    historicalBackground: string;
    structuralFeatures: string;
  }>;
  organizations: Array<{
    name: string;
    purpose: string;
    conflictRelationship: string;
    hierarchySystem: string;
  }>;
}

export interface CharacterSetting {
  name: string;
  englishName: string; 
  age: string;
  occupation: string;
  publicPersona: string;
  hiddenSelf: string;
  pastTrauma: string;
  greatestWeakness: string;
  potentialWhenOvercome: string;
  relationshipWithProtagonist?: string;
  goal?: string;
  reasonForConflictOrCooperation?: string;
  secret?: string;
  visualTags: string;
}

export interface SeriesSection {
  title: string;
  description: string;
}

export interface SeriesChapter {
  chapterNumber: string;
  title: string;
  estimatedPages: string;
  sections: SeriesSection[];
}

export interface VolumeDetail {
  volumeNumber: number;
  title: string;
  summary: string;
  chapters: SeriesChapter[];
}

export interface DetailedSetting {
  seriesTitle: string;
  volumes: VolumeDetail[];
  currentStatus: string;
  unresolvedList: string;
  progress: string;
  worldview: WorldviewSetting;
  protagonist: CharacterSetting;
  rivals: CharacterSetting[];
  artStyleTags: string;
  backgroundTags: string;
}

export interface GeneratedImageData {
  characterName: string;
  characterEnglishName?: string;
  fullBodyDesigns: string[];
}

// 世界観生成結果の型定義
export interface WorldGenerationResult {
  world_setting: string;
  characters: Array<{
    id: string;
    name: string;
    role: string;
    description: string;
    candidate_images: string[]; // 3枚の候補画像
  }>;
}

// 選択されたキャラクター画像の型定義
export interface SelectedCharacterImage {
  characterId: string;
  selectedImage: string; // 選択された画像のパスまたはbase64
  isUploaded: boolean; // アップロードされた画像かどうか
}

// 整形後のデータ型定義
export interface StoryGenerationData {
  world_setting: string;
  characters: Array<{
    id: string;
    name: string;
    role: string;
    description: string;
    // 画像フィールドは除外
  }>;
}

export interface ImageReferenceMap {
  [characterId: string]: string; // characterId -> 画像パス
}
