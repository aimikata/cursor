export type TargetAudience = 'JP' | 'EN';

export type PanelToolType = 'normal' | 'business' | 'youtube';

// 通常用コマ割りツールの型
export type NormalGenre =
  | 'AIおまかせ'
  | '恋愛'
  | '学園'
  | 'ビジネス'
  | 'バトル'
  | 'ダークファンタジー'
  | 'ロマンスファンタジー'
  | 'SF'
  | '日常系';

export type NormalMangaMode = 'story' | 'explanatory';

export interface NormalMangaInput {
  mode: NormalMangaMode;
  title: string;
  volume?: string;
  subtitle?: string;
  catchphrase?: string;
  author?: string;
  chapterTitle?: string;
  target: TargetAudience;
  genre: NormalGenre;
  pageCount: number;
  characterImages: CharacterImage[];
  scenario: string;
  worldSettings?: string;
  includeCover: boolean;
}

// ビジネス用コマ割りツールの型
export type BusinessGenre =
  | 'ビジネス・自己啓発'
  | '企業ドキュメンタリー'
  | '学習・ノウハウ'
  | '伝記・成功譚'
  | '医療・社会派';

export interface BusinessMangaInput {
  title: string;
  volume?: string;
  subtitle?: string;
  catchphrase?: string;
  author?: string;
  chapterTitle?: string;
  target: TargetAudience;
  genre: BusinessGenre;
  pageCount: number;
  characterImages: CharacterImage[];
  scenario: string;
  worldSettings?: string;
  includeCover: boolean;
}

// YouTube用コマ割りツールの型
export type YoutubeGenre =
  | 'ビジネス・自己啓発'
  | '企業ドキュメンタリー'
  | '学習・ノウハウ'
  | '伝記・成功譚'
  | '医療・社会派'
  | 'エンタメ・スカッと系'
  | 'ホラー・ミステリー';

export interface YoutubeMangaInput {
  mangaTitle: string;
  subtitle?: string;
  catchphrase?: string;
  channelName?: string;
  channelConcept?: string;
  genre: YoutubeGenre;
  pageCount: number;
  characterImages: CharacterImage[];
  scenario: string;
  worldSettings?: string;
  includeCover: boolean;
}

export interface CharacterImage {
  id: string;
  file: File | null;
  base64: string;
  mimeType: string;
  name: string;
}

export interface CsvRow {
  pageNumber: string;
  template: string;
  prompt: string;
  scriptSegment?: string; // YouTube用
}

export interface PanelInputData {
  storyData: {
    world_setting: string;
    characters: Array<{
      name: string;
      role: string;
    }>;
    episodes: Array<{
      title: string;
      story: string;
      summary: string;
    }>;
  };
  characterImages: Map<string, string>; // characterId -> image base64
}

// コマ割りツールの出力データ
export interface PanelOutputData {
  csvString: string;
  rows: CsvRow[];
  characterImages: Array<{
    name: string;
    data: string; // base64
    mimeType: string;
  }>;
  target: TargetAudience;
  title?: string;
}
