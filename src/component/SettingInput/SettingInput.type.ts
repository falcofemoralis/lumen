import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingInputComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
};
