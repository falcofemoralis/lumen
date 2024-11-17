import { Status } from './Player.type';

export const DEFAULT_STATUS: Status = {
  progressPercentage: 0,
  playablePercentage: 0,
  durationMillis: 0,
  isPlaying: false,
};

export enum RewindDirection {
  Backward = 'backward',
  Forward = 'forward',
}

export enum FocusedElement {
  TopBorder = 'topBorder',
  ProgressThumb = 'progressThumb',
  Action = 'action',
}

export const AWAKE_TAG = 'player';
