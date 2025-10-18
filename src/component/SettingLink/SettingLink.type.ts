import { SettingItem } from 'Route/SettingsPage/SettingsPage.type';

export type SettingLinkComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
