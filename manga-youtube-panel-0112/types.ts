
export type Genre =
  | 'ビジネス・自己啓発'
  | '企業ドキュメンタリー'
  | '学習・ノウハウ'
  | '伝記・成功譚'
  | '医療・社会派'
  | 'エンタメ・スカッと系'
  | 'ホラー・ミステリー';

export interface CharacterImage {
  id: string;
  file: File;
  base64: string; // Base64 string without prefix
  mimeType: string;
  name: string;
}

export interface MangaInput {
  mangaTitle: string;
  subtitle?: string;
  catchphrase?: string;
  channelName?: string;
  channelConcept?: string; // New: チャンネル独自のコンセプトや作風
  genre: Genre;
  pageCount: number;
  characterImages: CharacterImage[];
  scenario: string;
  worldSettings?: string;
  includeCover: boolean;
}

export interface CsvRow {
  pageNumber: string;
  template: string;
  scriptSegment: string;
  prompt: string;
}