import { SettingItem } from 'Route/SettingsPage/SettingsPage.type';

export type SettingTextComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
