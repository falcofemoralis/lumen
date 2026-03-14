import { Header } from 'Component/Header';
import { Page } from 'Component/Page';
import { SettingsStructure } from 'Component/SettingsStructure';
import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { SETTINGS_MODAL_SCREEN } from 'Navigation/navigationRoutes';
import { useState } from 'react';
import { updateSettings } from 'Screen/SettingsScreen/SettingsScreen.config';
import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';
import RouterStore from 'Store/Router.store';

export const SettingsModal = () => {
  const { setting, onSettingUpdate } = RouterStore.popData(SETTINGS_MODAL_SCREEN) as {
    setting: SettingItem;
    onSettingUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
  } ?? {};

  const { settings: initialSettings, title } = setting ?? {};

  const [settings, setSettings] = useState<SettingItem[]>(initialSettings ?? []);

  const onUpdate = async (settingProp: SettingItem, value: string) => {
    const { id } = settingProp;

    setSettings((prevSettings) => updateSettings(prevSettings, value, id));

    await onSettingUpdate(settingProp, value);

    return true;
  };

  return (
    <Page
      checkConnection={ false }
    >
      <ThemedSafeArea>
        <Header title={ title } />
        <SettingsStructure settings={ settings ?? [] } onSettingUpdate={ onUpdate } />
      </ThemedSafeArea>
    </Page>
  );
};

export default SettingsModal;
