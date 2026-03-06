import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingCustomSelectComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
