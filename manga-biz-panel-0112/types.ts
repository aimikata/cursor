
export type TargetAudience = 'JP' | 'EN';

export type Genre =
  | 'ビジネス・自己啓発'
  | '企業ドキュメンタリー'
  | '学習・ノウハウ'
  | '伝記・成功譚'
  | '医療・社会派';

export interface CharacterImage {
  id: string;
  file: File;
  base64: string; // Base64 string without prefix
  mimeType: string;
  name: string;
}

export interface MangaInput {
  // mode field removed (Explanatory only)
  title: string; // Series Title
  volume?: string; // Added Volume (e.g. "Vol.1")
  subtitle?: string; // Added Subtitle
  catchphrase?: string; // Added Catchphrase (Tagline)
  author?: string; // Added Author Name
  chapterTitle?: string; // Added Chapter Title
  target: TargetAudience;
  genre: Genre;
  pageCount: number;
  characterImages: CharacterImage[];
  scenario: string;
  worldSettings?: string;
  includeCover: boolean;
}

// Strictly 3 columns
export interface CsvRow {
  pageNumber: string;
  template: string;
  prompt: string;
}
