import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useState } from 'react';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { updateSettings } from 'Util/Settings';
import { useTripleTap } from 'Util/Settings/useTripleTap';

import SettingsPageComponent from './SettingsPage.component';
import SettingsPageComponentTV from './SettingsPage.component.atv';
import { getSettingsStructure } from './SettingsPage.config';
import { SettingItem } from './SettingsPage.type';

export function SettingsPageContainer() {
  const { setEnabled } = useKeyboardController();
  const serviceContext = useServiceContext();
  const navigation = useNavigation();
  const tripleTap = useTripleTap();

  const [settings, setSettings] = useState<SettingItem[]>(getSettingsStructure(
    serviceContext,
    navigation,
    tripleTap
  ));

  useFocusEffect(() => {
    setEnabled(true);

    return () => {
      setEnabled(false);
    };
  });

  const onSettingUpdate = async (setting: SettingItem, value: string) => {
    const { id, onSettingPress, disableUpdate } = setting;

    if (!onSettingPress) {
      return true;
    }

    if (!disableUpdate) {
      setSettings((prevSettings) => updateSettings(prevSettings, value, id));
    }

    onSettingPress?.(value, id, setSettings);

    return true;
  };

  const prepareSettings = () => {
    return updateSettings(settings);
  };

  return withTV(SettingsPageComponentTV, SettingsPageComponent, {
    settings: prepareSettings(),
    onSettingUpdate,
  });
}

export default SettingsPageContainer;
