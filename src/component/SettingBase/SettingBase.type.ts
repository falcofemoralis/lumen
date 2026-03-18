import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingBaseComponentProps = {
  setting: SettingItem;
  children?: React.ReactNode;
  isLoading?: boolean;
  onPress?: () => Promise<void> | void;
  onFocus?: () => void;
};
