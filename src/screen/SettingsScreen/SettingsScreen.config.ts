import { ASPECT_RATIO_OPTIONS, DEFAULT_SPEEDS, getAspectRatioLabel, MAX_QUALITY } from 'Component/Player/Player.config';
import { t } from 'i18n/translate';
import {
  ACCOUNT_SCREEN,
  BOOKMARKS_SCREEN,
  HOME_SCREEN,
  NOTIFICATIONS_SCREEN,
  RECENT_SCREEN,
  SEARCH_SCREEN,
} from 'Navigation/navigationRoutes';

export const GITHUB_LINK = 'https://github.com/falcofemoralis/lumen';
export const TELEGRAM_LINK = 'https://t.me/lumen_app';

export const TV_SCREENS = [
  {
    value: ACCOUNT_SCREEN,
    label: t('Account'),
  },
  {
    value: NOTIFICATIONS_SCREEN,
    label: t('Notifications'),
  },
  {
    value: HOME_SCREEN,
    label: t('Home'),
  },
  {
    value: RECENT_SCREEN,
    label: t('Recent'),
  },
  {
    value: SEARCH_SCREEN,
    label: t('Search'),
  },
  {
    value: BOOKMARKS_SCREEN,
    label: t('Bookmarks'),
  },
];

export const MOBILE_SCREENS = [
  {
    value: HOME_SCREEN,
    label: t('Home'),
  },
  {
    value: SEARCH_SCREEN,
    label: t('Search'),
  },
  {
    value: BOOKMARKS_SCREEN,
    label: t('Bookmarks'),
  },
  {
    value: RECENT_SCREEN,
    label: t('Recent'),
  },
  {
    value: ACCOUNT_SCREEN,
    label: t('Account'),
  },
];

export const THEME_SCHEME_OPTIONS = [
  { value: 'system', label: t('System default') },
  { value: 'dark', label: t('Dark') },
  { value: 'light', label: t('Light') },
];

export const APP_LANGUAGE_OPTIONS = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
];

export const COLUMNS_MOBILE_OPTIONS = Array.from({ length: 9 }, (_, index) => ({
  value: (index + 2).toString(),
  label: (index + 2).toString(),
}));

export const COLUMNS_TV_OPTIONS = Array.from({ length: 11 }, (_, index) => ({
  value: (index + 2).toString(),
  label: (index + 2).toString(),
}));

export const PLAYER_QUALITY_OPTIONS = [
  MAX_QUALITY,
  { value: '4K', label: '4K' },
  { value: '2K', label: '2K' },
  { value: '1080p Ultra', label: '1080p Ultra' },
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
  { value: '360p', label: '360p' },
];

export const PLAYER_REWIND_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const value = (index + 1) * 5;

  return {
    value: value.toString(),
    label: t('{{seconds}} seconds', { seconds: value }),
  };
});

export const PLAYER_ASPECT_RATIO_OPTIONS = ASPECT_RATIO_OPTIONS.map((option) => ({
  value: option,
  label: getAspectRatioLabel(option),
}));

export const PLAYER_LONG_PRESS_SPEED_OPTIONS = Array.from({ length: 12 }, (_, index) => {
  const value = (index + 1) * 0.25;

  return {
    value: value.toString(),
    label: `${value.toString()}x`,
  };
});

export const PLAYER_SPEED_OPTIONS = DEFAULT_SPEEDS.map((value) => ({
  value: value.toString(),
  label: `${value.toString()}x`,
}));

export const PLAYER_BUFFER_TIME_OPTIONS = [
  {
    value: 'auto',
    label: t('Auto'),
  },
  ...Array.from({ length: 12 }, (_, index) => {
    const value = (index + 1) * 15;

    return {
      value: value.toString(),
      label: t('{{seconds}} seconds', { seconds: value }),
    };
  }),
];

export const PLAYER_BACK_BUFFER_TIME_OPTIONS = [
  {
    value: '0',
    label: t('Off'),
  },
  ...[15, 30, 45, 60, 90, 120].map((value) => ({
    value: value.toString(),
    label: t('{{seconds}} seconds', { seconds: value }),
  })),
];
