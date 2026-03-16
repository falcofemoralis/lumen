import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingBaseComponentProps = {
  setting: SettingItem;
  children?: React.ReactNode;
  onPress?: () => Promise<void> | void;
  onFocus?: () => void;
};
