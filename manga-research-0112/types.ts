
export enum AppState {
  IDLE,
  PROPOSING_TOPICS,
  TOPICS_PROPOSED,
  GENERATING_CONCEPT,
  CONCEPT_COMPLETE,
}

export type TargetRegion = 'global' | 'domestic';
