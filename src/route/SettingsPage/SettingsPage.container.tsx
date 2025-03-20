import * as Application from 'expo-application';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import { useState } from 'react';
import { Linking } from 'react-native';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';

import SettingsPageComponent from './SettingsPage.component';
import { SETTING_TYPE, SettingItem } from './SettingsPage.type';

const GITHUB_LINK = 'https://github.com/falcofemoralis/lumen';

export function SettingsPageContainer() {
  const currentService = ServiceStore.getCurrentService();

  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'provider',
      title: t('Provider'),
      subtitle: t('Change provider'),
      type: SETTING_TYPE.INPUT,
      value: currentService.getProvider(),
    },
    {
      id: 'cdn',
      title: t('CDN'),
      subtitle: t('Change CDN'),
      type: SETTING_TYPE.SELECT,
      value: currentService.getCDN(),
      options: [
        {
          value: 'auto',
          label: t('Automatic'),
        },
      ].concat(currentService.defaultCDNs.map((cdn) => ({
        value: cdn,
        label: cdn,
      }))),
    },
    {
      id: 'userAgent',
      title: t('Useragent'),
      subtitle: t('Change useragent'),
      type: SETTING_TYPE.INPUT,
      value: currentService.getUserAgent(),
    },
    {
      id: 'github',
      title: 'Github',
      subtitle: t('Go to GitHub'),
      type: SETTING_TYPE.LINK,
      value: 'link',
    },
    {
      id: 'version',
      title: t('App version'),
      subtitle: Application.nativeApplicationVersion ?? '0.0.0',
      type: SETTING_TYPE.TEXT,
    },
  ]);

  const onSettingUpdate = async (id: string, value: string) => {
    try {
      switch (id) {
        case 'provider':
          await ServiceStore.updateProvider(value);
          break;
        case 'cdn':
          await ServiceStore.updateCDN(value);
          break;
        case 'userAgent':
          ServiceStore.updateUserAgent(value);
          break;
        case 'github':
          Linking.openURL(GITHUB_LINK);

          return true;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ConfigStore.updateConfig(id as any, value);
          break;
      }
    } catch (error) {
      NotificationStore.displayError(error as Error);

      return false;
    }

    setSettings((prevSettings) => prevSettings.map((setting) => ({
      ...setting,
      value: setting.id === id ? value : setting.value,
    })));

    return true;
  };

  const containerProps = () => ({
    settings,
  });

  const containerFunctions = {
    onSettingUpdate,
  };

  return withTV(SettingsPageComponent, SettingsPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default SettingsPageContainer;
