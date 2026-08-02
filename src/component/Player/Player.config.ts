import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { t } from 'i18n/translate';
import { ResizeMode } from 'react-native-video';

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

// i18n is initialised asynchronously after the module graph has loaded, so a `t()`
// evaluated here would freeze the untranslated key. Read the label lazily instead -
// that also keeps it correct after a language change.
export const MAX_QUALITY: DropdownItem = {
  get label() {
    return t('Maximum');
  },
  value: 'max',
};

export const AUTO_QUALITY: DropdownItem = {
  get label() {
    return t('Auto');
  },
  value: 'auto',
};

// the provider only ever lists real languages, so an empty code is free to stand
// for "no subtitles" - the player disables its text track for it
export const SUBTITLES_OFF: DropdownItem = {
  get label() {
    return t('Off');
  },
  value: '',
};

export const ASPECT_RATIO_OPTIONS: ResizeMode[] = ['contain', 'cover', 'stretch'];

// expo-video called the stretching mode `fill`, react-native-video calls it
// `stretch`. The setting is persisted by value, so old configs have to be mapped.
const LEGACY_ASPECT_RATIOS: Record<string, ResizeMode> = {
  fill: 'stretch',
};

export const getAspectRatio = (value?: string): ResizeMode => {
  const aspectRatio = LEGACY_ASPECT_RATIOS[value ?? ''] ?? value as ResizeMode;

  return ASPECT_RATIO_OPTIONS.includes(aspectRatio) ? aspectRatio : ASPECT_RATIO_OPTIONS[0];
};

export const getAspectRatioLabel = (aspectRatio: ResizeMode): string => {
  switch (aspectRatio) {
    case 'contain': return t('Contain');
    case 'cover': return t('Cover');
    case 'stretch': return t('Fill');
    default: return aspectRatio;
  }
};

// react-native-video refuses to build a source from an empty uri, so an
// unresolvable stream gets this placeholder - the player then reports a load
// error through `onError` instead of sitting on an empty source forever.
export const EMPTY_VIDEO_URL = 'file:///dev/null';