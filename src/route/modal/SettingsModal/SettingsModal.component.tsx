import Header from 'Component/Header';
import Page from 'Component/Page';
import SettingsStructure from 'Component/SettingsStructure';
import ThemedSafeArea from 'Component/ThemedSafeArea';
import { SETTINGS_MODAL_ROUTE } from 'Navigation/routes';
import { useState } from 'react';
import { SettingItem } from 'Route/SettingsPage/SettingsPage.type';
import RouterStore from 'Store/Router.store';
import { updateSettings } from 'Util/Settings';

export const SettingsModal = () => {
  const { setting, onSettingUpdate } = RouterStore.popData(SETTINGS_MODAL_ROUTE) as {
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
    <Page>
      <ThemedSafeArea>
        <Header title={ title } />
        <SettingsStructure settings={ settings ?? [] } onSettingUpdate={ onUpdate } />
      </ThemedSafeArea>
    </Page>
  );
};

export default SettingsModal;
