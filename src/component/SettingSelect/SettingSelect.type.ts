import { SettingItem } from 'Route/SettingsPage/SettingsPage.type';

export type SettingSelectComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
