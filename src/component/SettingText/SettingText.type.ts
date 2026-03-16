import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingTextComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
