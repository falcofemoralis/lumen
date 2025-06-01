import { ProgressStatus } from './Player.type';

export const DEFAULT_PROGRESS_STATUS: ProgressStatus = {
  progressPercentage: 0,
  playablePercentage: 0,
  currentTime: '-',
  durationTime: '-',
  remainingTime: '-',
};

export enum RewindDirection {
  BACKWARD = 'BACKWARD',
  FORWARD = 'FORWARD',
}

export enum FocusedElement {
  PROGRESS_THUMB = 'PROGRESS_THUMB',
  TOP_ACTION = 'TOP_ACTION',
  BOTTOM_ACTION = 'BOTTOM_ACTION',
}

export interface AutoRewindParams {
  ms: number;
  factor: number;
  active?: boolean;
  count: number;
  statusBefore?: boolean;
  seconds: number;
  wasStarted?: boolean; // to prevent first delay
}

export const AWAKE_TAG = 'player';

export const DEFAULT_REWIND_SECONDS = 10;
export const REWIND_SECONDS_TV = 30;

export const DEFAULT_AUTO_REWIND_SECONDS = 30; // rewind seconds
export const DEFAULT_AUTO_REWIND_MS = 35; // how many ms to wait

// vvv After test on real device, such approach not working, settings are not used
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

// 1 minutes * 60 seconds/minute * 1000 milliseconds/second
export const SAVE_TIME_EVERY_MS = 60000;

export const PLAYER_CONTROLS_TIMEOUT = 3000;
export const PLAYER_CONTROLS_ANIMATION = 150;

export const DEFAULT_SPEED = 1;
export const DEFAULT_SPEEDS = [0.25, 0.5, 1, 1.5, 2];

export const DOUBLE_TAP_ANIMATION = 2000;

export const FIRESTORE_DB = 'timestamps';
