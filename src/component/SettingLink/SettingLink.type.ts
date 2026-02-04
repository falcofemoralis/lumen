import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingLinkComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
