import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { VideoContentFit } from 'expo-video';
import { t } from 'i18n/translate';

import { ProgressStatus } from './Player.type';

export const DEFAULT_PROGRESS_STATUS: ProgressStatus = {
  progressPercentage: 0,
  playablePercentage: 0,
  currentTime: '-',
  durationTime: '-',
  remainingTime: '-',
  bufferedTime: '0',
  endDate: undefined,
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

export interface SmartSeekingParams {
  seconds: number;
  active?: boolean;
  seeking?: boolean;
  statusBefore?: boolean;
  percentage: number;
  iterations: number;
  velocity: number;
  delta: number;
}

export const AWAKE_TAG = 'player';

export const DEFAULT_SMART_SEEKING_PARAMS: SmartSeekingParams = {
  seconds: 15,
  percentage: 0,
  iterations: 0,
  velocity: 0.05,
  delta: 65,
};

export const LONG_PRESS_DURATION = 250;

export const SAVE_TIME_EVERY_MS = 30000;

export const PLAYER_CONTROLS_TIMEOUT = 3000;
export const PLAYER_CONTROLS_ANIMATION = 150;

export const DEFAULT_SPEED = 1;
export const DEFAULT_SPEEDS = [0.25, 0.5, 0.75, 1, 1.10, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

export const DOUBLE_TAP_ANIMATION = 2000;
export const DOUBLE_TAP_ANIMATION_DELAY = 150;

export const FIRESTORE_DB = 'timestamps';

export const MAX_QUALITY: DropdownItem = {
  label: t('Maximum'),
  value: 'max',
};

export const AUTO_QUALITY: DropdownItem = {
  label: t('Auto'),
  value: 'auto',
};

export const ASPECT_RATIO_OPTIONS: VideoContentFit[] = ['contain', 'cover', 'fill'];

export const getAspectRatioLabel = (aspectRatio: VideoContentFit): string => {
  switch (aspectRatio) {
    case 'contain': return t('Contain');
    case 'cover': return t('Cover');
    case 'fill': return t('Fill');
    default: return aspectRatio;
  }
};