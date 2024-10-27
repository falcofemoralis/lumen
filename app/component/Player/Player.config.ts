import { Status } from './Player.type';

export const DEFAULT_STATUS: Status = {
  progressPercentage: 0,
  playablePercentage: 0,
  durationMillis: 0,
  isPlaying: false,
};

export const SOURCE =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export enum RewindDirection {
  Backward = 'backward',
  Forward = 'forward',
}

export enum FocusedElement {
  TopBorder = 'topBorder',
  ProgressThumb = 'progressThumb',
  Action = 'action',
}
