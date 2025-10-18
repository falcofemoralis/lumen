import { SettingItem } from 'Route/SettingsPage/SettingsPage.type';

export type SettingInputComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
