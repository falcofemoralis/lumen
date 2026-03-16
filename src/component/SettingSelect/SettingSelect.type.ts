import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingSelectComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
