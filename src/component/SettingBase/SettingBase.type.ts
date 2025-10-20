import { SettingItem } from 'Route/SettingsPage/SettingsPage.type';

export type SettingBaseComponentProps = {
  setting: SettingItem;
  onPress?: () => void;
  onFocus?: () => void;
};
