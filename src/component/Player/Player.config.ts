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
  TopAction = 'topAction',
  BottomAction = 'bottomAction',
}

export const AWAKE_TAG = 'player';

export const DEFAULT_REWIND_SECONDS = 10;
export const DEFAULT_AUTO_REWIND_MS = 250;
export const DEFAULT_AUTO_REWIND_COUNT = 3;

export const LONG_PRESS_DURATION = 500;

export const QUALITY_OVERLAY_ID = 'qualityOverlayId';
export const IN_PLAYER_VIDEO_SELECTOR_OVERLAY_ID = 'IN_PLAYER_VIDEO_SELECTOR_OVERLAY_ID';

// 1 minutes * 60 seconds/minute * 1000 milliseconds/second
export const SAVE_TIME_EVERY_MS = 60000;
