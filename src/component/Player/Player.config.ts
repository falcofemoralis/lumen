import { ProgressStatus } from './Player.type';

export const DEFAULT_PROGRESS_STATUS: ProgressStatus = {
  progressPercentage: 0,
  playablePercentage: 0,
  currentTime: '-',
  durationTime: '-',
  remainingTime: '-',
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

export const DEFAULT_REWIND_SECONDS = 10;
export const DEFAULT_AUTO_REWIND_MS = 250;
export const DEFAULT_AUTO_REWIND_COUNT = 3;

export const LONG_PRESS_DURATION = 500;

export const QUALITY_OVERLAY_ID = 'qualityOverlayId';
