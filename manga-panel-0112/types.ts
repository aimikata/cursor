export type TargetAudience = 'JP' | 'EN';

export type Genre =
  | 'AIおまかせ'
  | '恋愛'
  | '学園'
  | 'ビジネス'
  | 'バトル'
  | 'ダークファンタジー'
  | 'ロマンスファンタジー'
  | 'SF'
  | '日常系';

export type MangaMode = 'story' | 'explanatory';

export interface CharacterImage {
  id: string;
  file: File;
  base64: string; // Base64 string without prefix
  mimeType: string;
  name: string;
}

export interface MangaInput {
  mode: MangaMode; // Added Mode
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