import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as Application from 'expo-application';
import { t } from 'i18n/translate';
import {
  Blend,
  Cloud,
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
import { useState } from 'react';
import { Linking } from 'react-native';
import { useTripleTap } from 'Screen/SettingsScreen/useTripleTap';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { GithubIcon, TelegramIcon } from 'Theme/icons';
import { restartApp } from 'Util/Device';
import { setTimeoutSafe } from 'Util/Misc';
import { convertBooleanToString, convertStringToBoolean, convertStringToNumber } from 'Util/Type';

import SettingsScreenComponent from './SettingsScreen.component';
import SettingsScreenComponentTV from './SettingsScreen.component.atv';
import {
  GITHUB_LINK,
  MOBILE_SCREENS,
  TELEGRAM_LINK,
  TV_SCREENS,
  updateSettings,
  yesNoOptions,
} from './SettingsScreen.config';
import { SETTING_TYPE, SettingItem } from './SettingsScreen.type';

export function SettingsScreenContainer() {
  const {
    setConfig,
    isTV,
    initialRoute,
    numberOfColumnsMobile,
    numberOfColumnsTV,
    isTVGridAnimation,
    isTVAwake,
    playerRewindSeconds,
    isFirestore,
    securedSettings,
  } = useConfigContext();
  const {
    currentService,
    updateProvider,
    updateCDN,
    updateUserAgent,
    updateOfficialMode,
    getCDNs,
  } = useServiceContext();
  const { theme } = useAppTheme();
  const { handleTap } = useTripleTap();

  const onSettingPress = (value: string | null, key: any) => {
    setConfig(key, convertStringToBoolean(convertStringToNumber(value)));
  };

  const [settings, setSettings] = useState<SettingItem[]>([
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
          value: initialRoute,
          options: isTV ? TV_SCREENS : MOBILE_SCREENS,
          IconComponent: Route,
          onSettingPress,
        },
        {
          id: 'numberOfColumnsMobile',
          title: t('Columns in list'),
          subtitle: t('Change number of columns.'),
          type: SETTING_TYPE.SELECT,
          value: numberOfColumnsMobile.toString(),
          options: Array.from({ length: 9 }, (_, index) => ({
            value: (index + 2).toString(),
            label: (index + 2).toString(),
          })),
          IconComponent: Grid3x2,
          onSettingPress,
          isHidden: isTV,
        },
        {
          id: 'numberOfColumnsTV',
          title: t('Columns in list'),
          subtitle: t('Change number of columns.'),
          type: SETTING_TYPE.SELECT,
          value: numberOfColumnsTV.toString(),
          options: Array.from({ length: 11 }, (_, index) => ({
            value: (index + 2).toString(),
            label: (index + 2).toString(),
          })),
          IconComponent: Grid3x2,
          onSettingPress: (value, key) => {
            setConfig(key, Number(value));
            NotificationStore.displayMessage(t('Restart app to apply changes.'));
            setTimeoutSafe(() => {
              restartApp();
            }, 2000);
          },
          isHidden: !isTV,
        },
        {
          id: 'isTVGridAnimation',
          title: t('Grid animation'),
          subtitle: t('Toggle grid animation.'),
          type: SETTING_TYPE.SELECT,
          value: convertBooleanToString(isTVGridAnimation),
          options: yesNoOptions,
          IconComponent: Blend,
          onSettingPress,
          isHidden: !isTV,
        },
        {
          id: 'isTVAwake',
          title: t('TV awake'),
          subtitle: t('Toggle TV awake.'),
          type: SETTING_TYPE.SELECT,
          value: convertBooleanToString(isTVAwake),
          options: yesNoOptions,
          IconComponent: MonitorPlay,
          onSettingPress,
          isHidden: !isTV,
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
          value: playerRewindSeconds.toString(),
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
          IconComponent: TelegramIcon,
          iconProps: {
            color: undefined,
            strokeWidth: 1,
            fill: theme.colors.icon,
            absoluteStrokeWidth: true,
          },
          iconPropsFocused: {
            fill: theme.colors.iconFocused,
          },
        },
        {
          id: 'github',
          title: 'Github',
          subtitle: t('Go to GitHub'),
          type: SETTING_TYPE.LINK,
          value: 'link',
          onSettingPress: () => Linking.openURL(GITHUB_LINK),
          IconComponent: GithubIcon,
        },
        {
          id: 'version',
          title: t('App version'),
          subtitle: Application.nativeApplicationVersion ?? '0.0.0',
          type: SETTING_TYPE.TEXT,
          disableUpdate: true,
          onSettingPress: (_, __, update) => {
            const result = handleTap();

            if (result) {
              setConfig('securedSettings', true);

              update((prevSettings) => prevSettings.map((st) => {
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
          IconComponent: Info,
        },
        {
          id: 'isFirestore',
          title: t('Time share'),
          subtitle: t('Toggle time share. It will consume more data.'),
          type: SETTING_TYPE.SELECT,
          value: convertBooleanToString(isFirestore),
          options: yesNoOptions,
          onSettingPress,
          isHidden: !securedSettings,
          IconComponent: Cloud,
        },
      ],
    },
  ]);

  const onSettingUpdate = async (setting: SettingItem, value: string) => {
    const { id, onSettingPress: onPress, disableUpdate } = setting;

    if (!onPress) {
      return true;
    }

    if (!disableUpdate) {
      setSettings((prevSettings) => updateSettings(prevSettings, value, id));
    }

    onPress?.(value, id, setSettings);

    return true;
  };

  const prepareSettings = () => {
    return updateSettings(settings);
  };

  const containerProps = {
    settings: prepareSettings(),
    onSettingUpdate,
  };

  return isTV ? <SettingsScreenComponentTV { ...containerProps } /> : <SettingsScreenComponent { ...containerProps } />;
}

export default SettingsScreenContainer;
