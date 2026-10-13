import { DeviceConfigType } from './index';

export type CloudSyncSettingScope = 'global' | 'mobile' | 'atv' | 'local';

const LOCAL_ONLY_SETTINGS = new Set<keyof DeviceConfigType>([
  'isTV',
  'isLocalLibrary',
  'numberOfColumnsMobile',
  'numberOfColumnsTV',
  'recentTwoColumnsTV',
  'mobileNavigationOrder',
  'hiddenMobileNavigationTabs',
  'tvNavigationOrder',
  'hiddenTVNavigationTabs',
  'homeDefaultTab',
  'homeTabOrder',
  'hiddenHomeTabs',
  'initialRoute',
  'tabPosition',
  'homeDisplayMode',
  'bookmarksDisplayMode',
  'recentDisplayMode',
  'newHomeInterface',
  'recentTabsInterface',
  'playerCompactSelector',
  'scrollToTopButtonCornerMobile',
  'scrollToTopButtonCornerTV',
  'scrollToTopButtonEnabled',
  'isConfigured',
  'isLowMode',
  'isTVAwake',
  'playerStopPlayOnButtonTV',
  'playerStopPlayShowInterfaceTV',
  'tvChannelsEnabled',
  'tvSearchEnabled',
  'playerVolumeGesture',
  'playerBrightnessGesture',
  'playerSwapGestureSides',
  'playerGestureStep',
  'playerSaveBrightness',
  'playerSavedBrightness',
  'playerSubtitlesSizeScale',
  'playerSubtitlesBottomOffset',
  'playerDefaultAspectRatio',
  'playerAutoFrameRateEnabled',
  'playerAutoFrameRate',
  'playerBufferTimeSetting',
  'playerBackBufferTimeSetting',
  'downloadsPath',
  'downloadsMaxParallel',
  'strictConnectionCheck',
]);

const MOBILE_SETTINGS = new Set<keyof DeviceConfigType>([
  'mobileNavigationOrder',
  'hiddenMobileNavigationTabs',
  'numberOfColumnsMobile',
  'commentPostingMobile',
]);

const ATV_SETTINGS = new Set<keyof DeviceConfigType>([
  'tvNavigationOrder',
  'hiddenTVNavigationTabs',
  'numberOfColumnsTV',
  'recentTwoColumnsTV',
  'playerStopPlayOnButtonTV',
  'playerStopPlayShowInterfaceTV',
  'commentPostingTV',
  'tvChannelsEnabled',
  'tvSearchEnabled',
  'isTVAwake',
]);

export const getCloudSyncSettingScope = (
  key: keyof DeviceConfigType,
): CloudSyncSettingScope => {
  if (LOCAL_ONLY_SETTINGS.has(key)) {
    return 'local';
  }

  if (MOBILE_SETTINGS.has(key)) {
    return 'mobile';
  }

  if (ATV_SETTINGS.has(key)) {
    return 'atv';
  }

  return 'global';
};

export const getCloudSyncSettingId = (
  key: keyof DeviceConfigType,
): string | null => {
  const scope = getCloudSyncSettingScope(key);

  if (scope === 'local') {
    return null;
  }

  if (scope === 'global') {
    return String(key);
  }

  return `${scope}:${String(key)}`;
};

export const getCloudSyncSettingFromId = (
  id: string,
): {
  key: keyof DeviceConfigType;
  scope: CloudSyncSettingScope;
  legacy: boolean;
} | null => {
  const separatorIndex = id.indexOf(':');

  if (separatorIndex > 0) {
    const prefix = id.slice(0, separatorIndex);
    const key = id.slice(separatorIndex + 1) as keyof DeviceConfigType;

    if (prefix === 'mobile' || prefix === 'atv') {
      return {
        key,
        scope: getCloudSyncSettingScope(key) === 'local' ? 'local' : prefix,
        legacy: false,
      };
    }
  }

  const key = id as keyof DeviceConfigType;
  const scope = getCloudSyncSettingScope(key);

  if (scope === 'mobile' || scope === 'atv') {
    return {
      key,
      scope,
      legacy: true,
    };
  }

  return {
    key,
    scope,
    legacy: false,
  };
};
