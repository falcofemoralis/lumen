import { useNavigation } from '@react-navigation/native';
import { useServiceContext } from 'Context/ServiceContext';
import * as Application from 'expo-application';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { LOGGER_ROUTE } from 'Route/LoggerPage/LoggerPage.config';
import useNotifications from 'Service/Notifications';
import ConfigStore from 'Store/Config.store';
import { yesNoOptions } from 'Util/Settings';
import { useTripleTap } from 'Util/Settings/useTripleTap';
import { convertBooleanToString, convertStringToBoolean } from 'Util/Type';

import SettingsPageComponent from './SettingsPage.component';
import SettingsPageComponentTV from './SettingsPage.component.atv';
import { GITHUB_LINK, TELEGRAM_LINK } from './SettingsPage.config';
import { SETTING_TYPE, SettingItem } from './SettingsPage.type';

export function SettingsPageContainer() {
  const {
    currentService,
    updateProvider,
    updateCDN,
    updateUserAgent,
    updateOfficialMode,
    getCDNs,
  } = useServiceContext();
  const { registerNotifications, unregisterNotifications } = useNotifications();
  const navigation = useNavigation();
  const { handleTap } = useTripleTap();

  const onPress = useCallback((value: string | null, key: any) => {
    ConfigStore.updateConfig(key, convertStringToBoolean(value));
  }, []);

  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'provider',
      title: t('Provider'),
      subtitle: t('Change provider'),
      type: SETTING_TYPE.INPUT,
      value: currentService.getDefaultProvider(),
      onPress: (value) => updateProvider(value as string),
      dependsOn: {
        field: 'officialMode',
        value: '',
      },
    },
    {
      id: 'officialMode',
      title: t('Official mode'),
      subtitle: t('Links will be used as in the official application.'),
      type: SETTING_TYPE.SELECT,
      value: currentService.getOfficialMode(),
      options: currentService.officialMirrors,
      onPress: (value) => updateOfficialMode(value as string),
    },
    {
      id: 'cdn',
      title: t('CDN'),
      subtitle: t('Change CDN'),
      type: SETTING_TYPE.SELECT,
      value: currentService.getCDN(),
      options: getCDNs(),
      onPress: (value) => updateCDN(value as string, true),
    },
    {
      id: 'userAgent',
      title: t('Useragent'),
      subtitle: t('Change useragent'),
      type: SETTING_TYPE.INPUT,
      value: currentService.getUserAgent(),
      onPress: (value) => updateUserAgent(value as string),
    },
    {
      id: 'notificationsEnabled',
      title: t('Notifications service'),
      subtitle: t('Toggle notifications.'),
      type: SETTING_TYPE.SELECT,
      value: convertBooleanToString(ConfigStore.getConfig().notificationsEnabled),
      options: yesNoOptions,
      onPress: (value, key) => {
        onPress(value, key);

        if (value === convertBooleanToString(true)) {
          registerNotifications();
        } else {
          unregisterNotifications();
        }
      },
      isHidden: ConfigStore.isTV(),
    },
    {
      id: 'isTVGridAnimation',
      title: t('Grid animation'),
      subtitle: t('Toggle grid animation.'),
      type: SETTING_TYPE.SELECT,
      value: convertBooleanToString(ConfigStore.getConfig().isTVGridAnimation),
      options: yesNoOptions,
      onPress,
      isHidden: !ConfigStore.isTV(),
    },
    {
      id: 'isTVAwake',
      title: t('TV awake'),
      subtitle: t('Toggle TV awake.'),
      type: SETTING_TYPE.SELECT,
      value: convertBooleanToString(ConfigStore.getConfig().isTVAwake),
      options: yesNoOptions,
      onPress,
      isHidden: !ConfigStore.isTV(),
    },
    {
      id: 'loggerEnabled',
      title: t('Enable logger'),
      subtitle: t('Enable logger to send logs to the developer.'),
      type: SETTING_TYPE.SELECT,
      value: convertBooleanToString(ConfigStore.getConfig().loggerEnabled),
      options: yesNoOptions,
      onPress,
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
      onPress: () => navigation.navigate(LOGGER_ROUTE),
    },
    {
      id: 'telegram',
      title: 'Telegram',
      subtitle: t('Go to Telegram'),
      type: SETTING_TYPE.LINK,
      value: 'link',
      onPress: () => Linking.openURL(TELEGRAM_LINK),
    },
    {
      id: 'github',
      title: 'Github',
      subtitle: t('Go to GitHub'),
      type: SETTING_TYPE.LINK,
      value: 'link',
      onPress: () => Linking.openURL(GITHUB_LINK),
    },
    {
      id: 'version',
      title: t('App version'),
      subtitle: Application.nativeApplicationVersion ?? '0.0.0',
      type: SETTING_TYPE.TEXT,
      disableUpdate: true,
      onPress: () => {
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
      onPress,
      isHidden: !ConfigStore.getConfig().securedSettings,
    },
  ]);

  const onSettingUpdate = async (setting: SettingItem, value: string) => {
    const { id, onPress: onPressSetting, disableUpdate } = setting;

    if (!onPressSetting) {
      return true;
    }

    if (!disableUpdate) {
      setSettings((prevSettings) => prevSettings.map((st) => ({
        ...st,
        value: st.id === id ? value : st.value,
        isEnabled: checkEnabled(st, prevSettings),
      })));
    }

    onPressSetting?.(value, id);

    return true;
  };

  const checkEnabled = (setting: SettingItem, allSettings: SettingItem[]) => {
    const { dependsOn } = setting;

    if (!dependsOn) {
      return setting.isEnabled !== undefined ? setting.isEnabled : true;
    }

    const { field, value } = dependsOn;

    const dependedSetting = allSettings.find((s) => s.id === field);

    return dependedSetting?.value === value;
  };

  const prepareSettings = () => {
    return settings.map((setting) => ({
      ...setting,
      isEnabled: checkEnabled(setting, settings),
    }));
  };

  const containerProps = () => ({
    settings: prepareSettings(),
  });

  const containerFunctions = {
    onSettingUpdate,
  };

  return withTV(SettingsPageComponentTV, SettingsPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default SettingsPageContainer;
