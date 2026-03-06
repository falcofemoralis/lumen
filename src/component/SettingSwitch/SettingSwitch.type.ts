import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingSwitchComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
