import {
  SUBTITLES_BOTTOM_OFFSETS,
  SUBTITLES_SIZE_SCALES,
} from 'Component/Player/Player.config';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { t } from 'i18n/translate';
import { SubtitleEdgeType } from 'Modules/react-native-subtitle-style';

/**
 * Every label here is read through a getter rather than being translated where the
 * constant is declared: the module body runs while it is imported, which is before
 * `initI18n()`, so an eager `t()` would freeze the untranslated key - and a getter is
 * also what keeps the label right once the language is changed.
 */

// Both of these are relative to the height of the player rather than absolute, so they
// are shown as what they are: 100% is the size the player draws by default, and the
// offset is how much of the picture stands between the subtitles and its bottom edge.
export const PLAYER_SUBTITLES_SIZE_OPTIONS = SUBTITLES_SIZE_SCALES.map((scale) => ({
  value: scale.toString(),
  label: `${Math.round(scale * 100)}%`,
}));

export const PLAYER_SUBTITLES_BOTTOM_OFFSET_OPTIONS = SUBTITLES_BOTTOM_OFFSETS.map((offset) => ({
  value: offset.toString(),
  label: `${Math.round(offset * 100)}%`,
}));

// #AARRGGBB, i.e. the alpha comes first - the native side hands these to
// `Color.parseColor`, which reads them the Android way rather than the CSS way.
export const PLAYER_SUBTITLES_COLOR_OPTIONS = [
  {
    value: '#FFFFFF',
    get label() {
      return t('White');
    },
  },
  {
    value: '#FFFF00',
    get label() {
      return t('Yellow');
    },
  },
  {
    value: '#00FFFF',
    get label() {
      return t('Cyan');
    },
  },
  {
    value: '#00FF00',
    get label() {
      return t('Green');
    },
  },
  {
    value: '#BFBFBF',
    get label() {
      return t('Grey');
    },
  },
  {
    value: '#000000',
    get label() {
      return t('Black');
    },
  },
];

export const PLAYER_SUBTITLES_BACKGROUND_OPTIONS = [
  {
    value: '#00000000',
    get label() {
      return t('None');
    },
  },
  {
    value: '#80000000',
    get label() {
      return t('Translucent black');
    },
  },
  {
    value: '#FF000000',
    get label() {
      return t('Black');
    },
  },
  {
    value: '#80808080',
    get label() {
      return t('Translucent grey');
    },
  },
  {
    value: '#FFFFFFFF',
    get label() {
      return t('White');
    },
  },
];

export const PLAYER_SUBTITLES_EDGE_OPTIONS = [
  {
    value: SubtitleEdgeType.NONE,
    get label() {
      return t('None');
    },
  },
  {
    value: SubtitleEdgeType.OUTLINE,
    get label() {
      return t('Outline');
    },
  },
  {
    value: SubtitleEdgeType.DROP_SHADOW,
    get label() {
      return t('Drop shadow');
    },
  },
  {
    value: SubtitleEdgeType.RAISED,
    get label() {
      return t('Raised');
    },
  },
  {
    value: SubtitleEdgeType.DEPRESSED,
    get label() {
      return t('Depressed');
    },
  },
];

/** The config keys the look of the subtitles is stored under, the switch aside. */
export type PlayerSubtitlesStyleKey =
  | 'playerSubtitlesSizeScale'
  | 'playerSubtitlesColor'
  | 'playerSubtitlesBackgroundColor'
  | 'playerSubtitlesEdgeType'
  | 'playerSubtitlesBottomOffset';

export interface PlayerSubtitlesStyleSetting {
  key: PlayerSubtitlesStyleKey;
  label: string;
  options: DropdownItem[];
  /** The two the config holds as numbers - a dropdown only ever hands back a string. */
  isNumeric?: boolean;
}

/**
 * The settings the overlay offers, in the order the settings screen shows them: the
 * player styles the subtitles through the very same config, so the two are one feature
 * and should read as one.
 */
export const PLAYER_SUBTITLES_STYLE_SETTINGS: PlayerSubtitlesStyleSetting[] = [
  {
    key: 'playerSubtitlesSizeScale',
    get label() {
      return t('Subtitles size');
    },
    options: PLAYER_SUBTITLES_SIZE_OPTIONS,
    isNumeric: true,
  },
  {
    key: 'playerSubtitlesColor',
    get label() {
      return t('Subtitles color');
    },
    options: PLAYER_SUBTITLES_COLOR_OPTIONS,
  },
  {
    key: 'playerSubtitlesBackgroundColor',
    get label() {
      return t('Subtitles background');
    },
    options: PLAYER_SUBTITLES_BACKGROUND_OPTIONS,
  },
  {
    key: 'playerSubtitlesEdgeType',
    get label() {
      return t('Subtitles outline');
    },
    options: PLAYER_SUBTITLES_EDGE_OPTIONS,
  },
  {
    key: 'playerSubtitlesBottomOffset',
    get label() {
      return t('Subtitles position');
    },
    options: PLAYER_SUBTITLES_BOTTOM_OFFSET_OPTIONS,
    isNumeric: true,
  },
];
