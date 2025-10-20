import { SettingItem } from 'Route/SettingsPage/SettingsPage.type';

export type SettingsStructureComponentProps = {
  settings: SettingItem[];
  onSettingUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};