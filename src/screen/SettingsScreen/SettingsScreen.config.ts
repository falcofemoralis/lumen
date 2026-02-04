import { t } from 'i18n/translate';
import {
  ACCOUNT_SCREEN,
  BOOKMARKS_SCREEN,
  HOME_SCREEN,
  NOTIFICATIONS_SCREEN,
  RECENT_SCREEN,
  SEARCH_SCREEN,
} from 'Navigation/navigationRoutes';
import { convertBooleanToString } from 'Util/Type';

import { SettingItem } from './SettingsScreen.type';

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

export const yesNoOptions = [
  {
    value: convertBooleanToString(true),
    label: t('Yes'),
  },
  {
    value: convertBooleanToString(false),
    label: t('No'),
  },
];

export const checkEnabled = (setting: SettingItem, allSettings: SettingItem[]) => {
  const { dependsOn } = setting;

  if (!dependsOn) {
    return setting.isEnabled !== undefined ? setting.isEnabled : true;
  }

  const { field, value } = dependsOn;

  const dependedSetting = allSettings.find((s) => s.id === field);

  return dependedSetting?.value === value;
};

export const updateSettings = (settings: SettingItem[], value?: string, id?: string) => {
  const settingsWithNewValue = settings.map((st) => ({
    ...st,
    value: st.id === id ? value : st.value,
    settings: st.settings?.map((s) => ({
      ...s,
      value: s.id === id ? value : s.value,
    })),
  }));

  return settingsWithNewValue.map((st) => ({
    ...st,
    isEnabled: checkEnabled(st, settingsWithNewValue),
    settings: st.settings?.map((s) => ({
      ...s,
      isEnabled: checkEnabled(s, st.settings ?? []),
    })),
  }));
};