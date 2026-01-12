
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
    name:string;
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
