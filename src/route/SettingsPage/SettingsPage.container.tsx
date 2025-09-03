import { useServiceContext } from 'Context/ServiceContext';
import * as Application from 'expo-application';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import ConfigStore from 'Store/Config.store';

import SettingsPageComponent from './SettingsPage.component';
import SettingsPageComponentTV from './SettingsPage.component.atv';
import { GITHUB_LINK } from './SettingsPage.config';
import { SETTING_TYPE, SettingItem } from './SettingsPage.type';

export function SettingsPageContainer() {
  const {
    currentService,
    updateProvider,
    updateCDN,
    updateUserAgent,
    updateOfficialMode,
  } = useServiceContext();

  const updateConfig = useCallback((value: string, key: any) => {
    ConfigStore.updateConfig(key, value);
  }, []);

  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'provider',
      title: t('Provider'),
      subtitle: t('Change provider'),
      type: SETTING_TYPE.INPUT,
      value: currentService.getProvider(),
      onPress: updateProvider,
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
      onPress: (value) => updateCDN(value, true),
    },
    {
      id: 'userAgent',
      title: t('Useragent'),
      subtitle: t('Change useragent'),
      type: SETTING_TYPE.INPUT,
      value: currentService.getUserAgent(),
      onPress: updateUserAgent,
    },
    {
      id: 'isFirestore',
      title: t('Time share'),
      subtitle: t('Toggle time share. It will consume more data.'),
      type: SETTING_TYPE.SELECT,
      value: ConfigStore.isFirestore() ? 'true' : 'false',
      options: [
        {
          value: 'true',
          label: t('Yes'),
        },
        {
          value: 'false',
          label: t('No'),
        },
      ],
      onPress: updateConfig,
    },
    {
      id: 'officialMode',
      title: t('Official mode'),
      subtitle: t('Links will be used as in the official application.'),
      type: SETTING_TYPE.SELECT,
      value: currentService.getOfficialMode(),
      options: currentService.officialMirrors,
      onPress: updateOfficialMode,
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
    },
  ]);

  const onSettingUpdate = async (setting: SettingItem, value: string) => {
    const { id, onPress } = setting;

    setSettings((prevSettings) => prevSettings.map((st) => ({
      ...st,
      value: st.id === id ? value : st.value,
    })));

    onPress?.(value, id);

    return true;
  };

  const containerProps = () => ({
    settings,
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
