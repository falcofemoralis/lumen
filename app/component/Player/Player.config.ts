import { Status } from './Player.type';

export const DEFAULT_STATUS: Status = {
  progressPercentage: 0,
  playablePercentage: 0,
  isPlaying: false,
};

export enum RewindDirection {
  Backward = 'backward',
  Forward = 'forward',
}

export enum FocusedElement {
  ProgressThumb = 'progressThumb',
  Action = 'action',
}

export const AWAKE_TAG = 'player';
export const TIME_UPDATE_INTERVAL = 1;
