export type GenerationMode = 'series' | 'oneshot' | 'chapter';

export interface Character {
  name: string;
  role: string;
  image: string | null;
  imageMimeType: string | null;
}

export interface MasterSheet {
  progress: string;
  acquisition_level: string;
  unrecovered_list: string[];
  plot_points?: string[];
}

export interface Episode {
  title: string;
  story: string;
  summary: string;
  volumeNumber?: number;
  chapterNumber?: number;
  introduction?: string;
  commentary?: string;
  epilogue?: string;
  bonus?: string;
  archive?: string[];
  extra?: string;
  masterSheet?: MasterSheet;
  generatedBy?: string;
}

// ストーリー生成用の入力データ（セミオートモード用）
export interface StoryGenerationInput {
  world_setting: string;
  characters: Array<{
    id: string;
    name: string;
    role: string;
    description: string;
  }>;
}

// 統一されたストーリー出力データ
export interface StoryOutput {
  world_setting: string;
  characters: Character[];
  episodes: Episode[];
  generationMode: GenerationMode;
  metadata?: {
    createdAt: number;
    updatedAt: number;
  };
}
