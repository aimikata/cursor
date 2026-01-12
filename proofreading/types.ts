
export interface Correction {
  original: string;
  corrected: string;
}

export interface PageData {
  pageNumber: number;
  originalText: string;
  imageUrl: string;
  fileName: string;
}

export interface AnalysisResult {
  corrections: Correction[];
  pageHasMistake: boolean;
  originalFullText: string;
}