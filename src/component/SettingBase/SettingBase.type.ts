import { ReactNode } from 'react';
import { SettingItem } from 'Screen/SettingsScreen/SettingsScreen.type';

export type SettingBaseComponentProps = {
  setting: SettingItem;
  children?: ReactNode;
  isLoading?: boolean;
  onPress?: () => Promise<void> | void;
  onFocus?: () => void;
};
