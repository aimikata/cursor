export type Language = 'en' | 'ja';

export interface MangaPage {
  pageNumber: number;
  template: string;
  prompt: string;
  dialogueOnly?: string; // For spell check/reference
  dialogueTranslation?: string; // For reference
  status: 'idle' | 'generating' | 'completed' | 'error';
  imageUrl?: string;
  error?: string;
}

export interface CharacterImage {
  name: string; // e.g., "Liam Maxwell.jpg"
  data: string; // base64 string
  mimeType: string;
}

export interface GenerationConfig {
  apiKey?: string;
}