import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingGroupComponentProps = {
  setting: SettingItem;
  onUpdate: (setting: SettingItem, value: string) => Promise<boolean>;
  onSelect?: (setting: SettingItem) => void;
};
