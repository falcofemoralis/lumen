import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingBaseComponentProps = {
  setting: SettingItem;
  onPress?: () => void;
  onFocus?: () => void;
};
