import { NavigationProp, NavigationState } from '@react-navigation/native';
import { ServiceContextInterface } from 'Context/ServiceContext';
import * as Application from 'expo-application';
import t from 'i18n/t';
import {
  Blend,
  Bug,
  BugPlay,
  CloudCog,
  FolderCog,
  Globe,
  Grid3x2,
  Info,
  MonitorPlay,
  Palette,
  Rewind,
  Route,
  ShieldCheck,
  TvMinimalPlay,
  UserCog,
} from 'lucide-react-native';
import {
  ACCOUNT_ROUTE,
  BOOKMARKS_ROUTE,
  HOME_ROUTE,
  LOGGER_ROUTE,
  NOTIFICATIONS_ROUTE,
  RECENT_ROUTE,
  SEARCH_ROUTE,
} from 'Navigation/routes';
import { Linking } from 'react-native';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import { restartApp } from 'Util/Device';
import { setTimeoutSafe } from 'Util/Misc';
import { onSettingPress, yesNoOptions } from 'Util/Settings';
import { TripleTapInterface } from 'Util/Settings/useTripleTap';
import { convertBooleanToString } from 'Util/Type';

import { SETTING_TYPE, SettingItem } from './SettingsPage.type';

export const GITHUB_LINK = 'https://github.com/falcofemoralis/lumen';
export const TELEGRAM_LINK = 'https://t.me/lumen_app';

export const TV_ROUTES = [
  {
    value: ACCOUNT_ROUTE,
    label: t('Account'),
  },
  {
    value: NOTIFICATIONS_ROUTE,
    label: t('Notifications'),
  },
  {
    value: HOME_ROUTE,
    label: t('Home'),
  },
  {
    value: RECENT_ROUTE,
    label: t('Recent'),
  },
  {
    value: SEARCH_ROUTE,
    label: t('Search'),
  },
  {
    value: BOOKMARKS_ROUTE,
    label: t('Bookmarks'),
  },
];

export const MOBILE_ROUTES = [
  {
    value: HOME_ROUTE,
    label: t('Home'),
  },
  {
    value: SEARCH_ROUTE,
    label: t('Search'),
  },
  {
    value: BOOKMARKS_ROUTE,
    label: t('Bookmarks'),
  },
  {
    value: RECENT_ROUTE,
    label: t('Recent'),
  },
  {
    value: ACCOUNT_ROUTE,
    label: t('Account'),
  },
];

export const getSettingsStructure = (
  serviceContext: ServiceContextInterface,
  navigation: Omit<NavigationProp<ReactNavigation.RootParamList>, 'getState'> & {
    getState(): NavigationState | undefined;
  },
  tripleTap: TripleTapInterface
): SettingItem[] => {
  const {
    currentService,
    updateProvider,
    updateCDN,
    updateUserAgent,
    updateOfficialMode,
    getCDNs,
  } = serviceContext;
  const { handleTap } = tripleTap;

  return [
    {
      id: 'appearance-group',
      type: SETTING_TYPE.GROUP,
      title: t('Appearance'),
      IconComponent: Palette,
      settings: [
        {
          id: 'initialRoute',
          title: t('Initial route'),
          subtitle: t('Change initial route.'),
          type: SETTING_TYPE.SELECT,
          value: ConfigStore.getConfig().initialRoute,
          options: ConfigStore.isTV() ? TV_ROUTES : MOBILE_ROUTES,
          IconComponent: Route,
          onSettingPress,
        },
        {
          id: 'numberOfColumnsMobile',
          title: t('Columns in list'),
          subtitle: t('Change number of columns.'),
          type: SETTING_TYPE.SELECT,
          value: ConfigStore.getConfig().numberOfColumnsMobile.toString(),
          options: Array.from({ length: 9 }, (_, index) => ({
            value: (index + 2).toString(),
            label: (index + 2).toString(),
          })),
          IconComponent: Grid3x2,
          onSettingPress,
          isHidden: ConfigStore.isTV(),
        },
        {
          id: 'numberOfColumnsTV',
          title: t('Columns in list'),
          subtitle: t('Change number of columns.'),
          type: SETTING_TYPE.SELECT,
          value: ConfigStore.getConfig().numberOfColumnsTV.toString(),
          options: Array.from({ length: 11 }, (_, index) => ({
            value: (index + 2).toString(),
            label: (index + 2).toString(),
          })),
          IconComponent: Grid3x2,
          onSettingPress: (value, key) => {
            ConfigStore.updateConfig(key, Number(value));
            NotificationStore.displayMessage(t('Restart app to apply changes.'));
            setTimeoutSafe(() => {
              restartApp();
            }, 2000);
          },
          isHidden: !ConfigStore.isTV(),
        },
        {
          id: 'isTVGridAnimation',
          title: t('Grid animation'),
          subtitle: t('Toggle grid animation.'),
          type: SETTING_TYPE.SELECT,
          value: convertBooleanToString(ConfigStore.getConfig().isTVGridAnimation),
          options: yesNoOptions,
          IconComponent: Blend,
          onSettingPress,
          isHidden: !ConfigStore.isTV(),
        },
        {
          id: 'isTVAwake',
          title: t('TV awake'),
          subtitle: t('Toggle TV awake.'),
          type: SETTING_TYPE.SELECT,
          value: convertBooleanToString(ConfigStore.getConfig().isTVAwake),
          options: yesNoOptions,
          IconComponent: MonitorPlay,
          onSettingPress,
          isHidden: !ConfigStore.isTV(),
        },
      ],
    },
    {
      id: 'network-group',
      type: SETTING_TYPE.GROUP,
      title: t('Network'),
      IconComponent: Globe,
      settings: [
        {
          id: 'officialMode',
          title: t('Official mode'),
          subtitle: t('Links will be used as in the official application.'),
          type: SETTING_TYPE.SELECT,
          value: currentService.getOfficialMode(),
          options: currentService.officialMirrors,
          IconComponent: ShieldCheck,
          onSettingPress: (value) => updateOfficialMode(value as string),
        },
        {
          id: 'provider',
          title: t('Provider'),
          subtitle: t('Change provider'),
          type: SETTING_TYPE.INPUT,
          value: currentService.getDefaultProvider(),
          onSettingPress: (value) => updateProvider(value as string),
          IconComponent: CloudCog,
          dependsOn: {
            field: 'officialMode',
            value: '',
          },
        },
        {
          id: 'cdn',
          title: t('CDN'),
          subtitle: t('Change CDN'),
          type: SETTING_TYPE.SELECT,
          value: currentService.getCDN(),
          options: getCDNs(),
          IconComponent: FolderCog,
          onSettingPress: (value) => updateCDN(value as string, true),
        },
        {
          id: 'userAgent',
          title: t('Useragent'),
          subtitle: t('Change useragent'),
          type: SETTING_TYPE.INPUT,
          value: currentService.getUserAgent(),
          IconComponent: UserCog,
          onSettingPress: (value) => updateUserAgent(value as string),
        },
      ],
    },
    {
      id: 'player-group',
      type: SETTING_TYPE.GROUP,
      title: t('Player'),
      IconComponent: TvMinimalPlay,
      settings: [
        {
          id: 'playerRewindSeconds',
          title: t('Player rewind seconds'),
          subtitle: t('Change player rewind seconds.'),
          type: SETTING_TYPE.SELECT,
          value: ConfigStore.getConfig().playerRewindSeconds.toString(),
          options: Array.from({ length: 12 }, (_, index) => {
            const value = (index + 1) * 5;

            return {
              value: value.toString(),
              label: value.toString(),
            };
          }),
          IconComponent: Rewind,
          onSettingPress,
        },
      ],
    },
    {
      id: 'debug-group',
      type: SETTING_TYPE.GROUP,
      title: t('Debug'),
      IconComponent: Bug,
      settings: [
        {
          id: 'loggerEnabled',
          title: t('Enable logger'),
          subtitle: t('Enable logger to send logs to the developer.'),
          type: SETTING_TYPE.SELECT,
          value: convertBooleanToString(ConfigStore.getConfig().loggerEnabled),
          options: yesNoOptions,
          IconComponent: BugPlay,
          onSettingPress,
        },
        {
          id: 'seeLogs',
          title: t('See logs'),
          subtitle: t('Check and send logs to the developer.'),
          type: SETTING_TYPE.LINK,
          dependsOn: {
            field: 'loggerEnabled',
            value: convertBooleanToString(true),
          },
          IconComponent: Bug,
          onSettingPress: () => navigation.navigate(LOGGER_ROUTE),
        },
      ],
    },
    {
      id: 'about-group',
      type: SETTING_TYPE.GROUP,
      title: t('About'),
      IconComponent: Info,
      settings: [
        {
          id: 'telegram',
          title: 'Telegram',
          subtitle: t('Go to Telegram'),
          type: SETTING_TYPE.LINK,
          value: 'link',
          onSettingPress: () => Linking.openURL(TELEGRAM_LINK),
        },
        {
          id: 'github',
          title: 'Github',
          subtitle: t('Go to GitHub'),
          type: SETTING_TYPE.LINK,
          value: 'link',
          onSettingPress: () => Linking.openURL(GITHUB_LINK),
        },
        {
          id: 'version',
          title: t('App version'),
          subtitle: Application.nativeApplicationVersion ?? '0.0.0',
          type: SETTING_TYPE.TEXT,
          disableUpdate: true,
          onSettingPress: (_, __, setSettings) => {
            const result = handleTap();

            if (result) {
              ConfigStore.updateConfig('securedSettings', true);

              setSettings((prevSettings) => prevSettings.map((st) => {
                if (st.id === 'isFirestore') {
                  return {
                    ...st,
                    isHidden: false,
                  };
                }

                return st;
              }));
            }
          },
        },
        {
          id: 'isFirestore',
          title: t('Time share'),
          subtitle: t('Toggle time share. It will consume more data.'),
          type: SETTING_TYPE.SELECT,
          value: convertBooleanToString(ConfigStore.getConfig().isFirestore),
          options: yesNoOptions,
          onSettingPress,
          isHidden: !ConfigStore.getConfig().securedSettings,
        },
      ],
    },
  ];
};