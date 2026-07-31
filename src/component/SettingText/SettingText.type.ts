import { SettingCommonProps } from 'Component/SettingBase/SettingBase.type';

export type SettingTextComponentProps = SettingCommonProps & {
  onPress?: () => Promise<void> | void;
};
