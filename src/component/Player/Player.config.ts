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

/** Below this many seconds a position is not worth saving - see `updateTime`. */
export const MIN_SAVED_TIME = 1;

export const PLAYER_CONTROLS_TIMEOUT = 3000;
export const PLAYER_CONTROLS_ANIMATION = 150;

export const DEFAULT_SPEED = 1;
export const DEFAULT_SPEEDS = [0.25, 0.5, 0.75, 1, 1.10, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3];

export const DOUBLE_TAP_ANIMATION = 2000;
export const DOUBLE_TAP_ANIMATION_DELAY = 150;

/**
 * How the subtitles look, as the settings store it.
 *
 * The size is a multiple of what the player draws by default rather than a point size,
 * and the offset is a fraction of the player's height rather than a distance - both are
 * turned into what media3 takes in `useSubtitleStyle`. Neither has a unit that means
 * anything on its own: the same subtitles are drawn on a phone held at arm's length and
 * on a TV across the room, and only a size relative to the picture reads the same on both.
 *
 * The values below repeat `SubtitleView`'s own defaults rather than importing them,
 * because everything this file is imported from has to stay loadable outside the app -
 * see the config tests.
 */
export const DEFAULT_SUBTITLES_SIZE_SCALE = 1;
export const SUBTITLES_SIZE_SCALES = [0.75, 0.85, 1, 1.15, 1.3, 1.5, 1.75, 2];

export const DEFAULT_SUBTITLES_BOTTOM_OFFSET = 0.08;
export const SUBTITLES_BOTTOM_OFFSETS = [0, 0.04, 0.08, 0.12, 0.16, 0.2, 0.25, 0.3];

export const DEFAULT_SUBTITLES_COLOR = '#FFFFFF';
export const DEFAULT_SUBTITLES_BACKGROUND_COLOR = '#FF000000';
export const DEFAULT_SUBTITLES_EDGE_TYPE = 'outline';

/**
 * How hard volume normalization compresses, as the settings store it.
 *
 * A plain string rather than the native module's `LoudnessStrength`, for the same reason
 * the subtitle edge type above is one: everything this file is imported from has to stay
 * loadable outside the app, and that enum sits next to a `requireNativeModule` call.
 * `useVolumeNormalization` is what turns the one into the other.
 *
 * The middle setting is the default because it is the one that sounds like the film:
 * enough to make a night-time watch workable, not so much that the mix stops breathing.
 */
export const DEFAULT_VOLUME_NORMALIZATION_STRENGTH = 'medium';

/** What a vertical slide over one half of the player adjusts. */
export enum PlayerSlideControl {
  VOLUME = 'VOLUME',
  BRIGHTNESS = 'BRIGHTNESS',
}

/**
 * How much of the player's height a finger travels to cross the whole 0..1 range.
 * Less than all of it, so the ends stay in reach of a thumb that started somewhere
 * comfortable rather than at the very edge of the screen.
 */
export const SLIDE_RANGE_RATIO = 0.75;

/** Vertical travel before a slide takes the touch away from the taps it shares the player with. */
export const SLIDE_ACTIVATION_DISTANCE = 12;

/** ...and the horizontal travel that hands the touch back to them instead. */
export const SLIDE_FAIL_DISTANCE = 20;

/**
 * Steps the range is applied to the device in. The bar follows the finger frame by
 * frame on the UI thread; the device only hears about a step it is not already on,
 * which keeps a full drag to a few dozen native calls rather than one per frame.
 */
export const SLIDE_STEPS = 50;

export const SLIDE_INDICATOR_ANIMATION = 150;

/**
 * How far in from the edge the level sits, as a percent of the player width. It is
 * placed at whichever of the two the finger is not on, so the hand does not cover it.
 */
export const SLIDE_INDICATOR_OFFSET = 20;

/** How long the level stays on screen after the finger lifts. */
export const SLIDE_INDICATOR_TIMEOUT = 600;

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