export enum AppState {
  IDLE,
  PROPOSING_TOPICS,
  TOPICS_PROPOSED,
  GENERATING_CONCEPT,
  CONCEPT_COMPLETE,
}

export type TargetRegion = 'global' | 'domestic';

// GENRE_LIST を constants.ts から再エクスポート
export { GENRE_LIST } from './constants';
