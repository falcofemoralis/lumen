import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingsStructureComponentProps = {
  settings: SettingItem[];
  onSettingUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};