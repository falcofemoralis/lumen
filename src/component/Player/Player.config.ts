/* eslint-disable max-len */
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

export interface AutoRewindParams {
  ms: number;
  factor: number;
  active?: boolean;
  count: number;
  statusBefore?: boolean;
  seconds: number;
}

export const AWAKE_TAG = 'player';

export const DEFAULT_REWIND_SECONDS = 10;

export const DEFAULT_AUTO_REWIND_SECONDS = 30; // rewind seconds
export const DEFAULT_AUTO_REWIND_MS = 100; // how many ms to wait
export const DEFAULT_AUTO_REWIND_FACTOR = 40; // how many times wait (DEFAULT_AUTO_REWIND_MS) and rewind
export const DEFAULT_AUTO_REWIND_MIN_MS = 40; // divided ms can't be less than this value
export const DEFAULT_AUTO_REWIND_MULTIPLIER = 1.5; // this value will multiple factor and divide ms

export const DEFAULT_AUTO_REWIND_PARAMS: AutoRewindParams = {
  ms: DEFAULT_AUTO_REWIND_MS,
  factor: DEFAULT_AUTO_REWIND_FACTOR,
  count: 0,
  seconds: DEFAULT_AUTO_REWIND_SECONDS,
};

export const LONG_PRESS_DURATION = 500;

export const QUALITY_OVERLAY_ID = 'qualityOverlayId';
export const IN_PLAYER_VIDEO_SELECTOR_OVERLAY_ID = 'IN_PLAYER_VIDEO_SELECTOR_OVERLAY_ID';
export const SUBTITLE_OVERLAY_ID = 'subtitleOverlayId';

// 1 minutes * 60 seconds/minute * 1000 milliseconds/second
export const SAVE_TIME_EVERY_MS = 60000;

export const PLAYER_CONTROLS_TIMEOUT = 4000;
export const PLAYER_CONTROLS_ANIMATION = 150;
