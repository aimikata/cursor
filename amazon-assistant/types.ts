
export interface APlusModule {
  moduleName: string;
  purpose: string;
  imageSuggestion: string;
  bigHeadline: string;
  headline: string;
  description: string;
}

export interface KDPDetails {
  language: string;
  title: string;
  titleKana: string;
  titleRomaji: string;
  subtitle: string;
  subtitleKana: string;
  subtitleRomaji: string;
  seriesName: string;
  seriesVolume: string;
  author: string;
  authorKana?: string; // Optional context
  description: string;
  publishingRights: string;
  keywords: string[];
  categories: string[];
  adultContent: string;
}

export interface KDPContent {
  drm: string;
  manuscriptFileName: string;
  coverFileName: string;
  aiGeneratedContent: string;
}

export interface KDPPricing {
  kdpSelect: string;
  marketplace: string;
  territory: string;
  royaltyPlan: string;
  price: string;
}

export interface GeneratedContent {
  kdpDetails: KDPDetails;
  kdpContent: KDPContent;
  kdpPricing: KDPPricing;
  aPlusContent: APlusModule[];
}

export interface ImageFile {
  file: File;
  preview: string;
}

export interface ImageFiles {
  character: File | null;
  memorable1: File | null;
  memorable2: File | null;
  memorable3: File | null;
  author: File | null;
}

export interface ImagePayload {
  mimeType: string;
  data: string;
}

export interface AllImagePayloads {
  character: ImagePayload;
  memorable1: ImagePayload;
  memorable2: ImagePayload;
  memorable3: ImagePayload;
  author?: ImagePayload;
}
