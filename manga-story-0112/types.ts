import type { Content } from '@google/genai';

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
  plot_points?: string[]; // 伏線・未回収の謎リスト
}

export interface Episode {
  title: string;
  story: string;
  summary: string;
  introduction?: string;
  commentary?: string;
  epilogue?: string;
  bonus?: string;
  archive?: string[];
  extra?: string;
  masterSheet?: MasterSheet;
  generatedBy?: string; // The model name used to generate this episode
}

export interface Project {
  id: string;
  name: string;
  worldSetting: string;
  storyTheme: string;
  // Chapter Mode Fields
  seriesTitle?: string;
  chapterTitle?: string;
  tocList?: string;
  
  characters: Character[];
  episodeTitles: string[];
  episodes: Episode[];
  generationMode: GenerationMode;
  chatHistory: Content[] | null;
  createdAt: number;
  updatedAt: number;
}