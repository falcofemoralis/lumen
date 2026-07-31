import { SettingChangeHandler, SettingCommonProps } from 'Component/SettingBase/SettingBase.type';

export type SettingSwitchComponentProps = SettingCommonProps & {
  value: boolean;
  onChange: SettingChangeHandler<boolean>;
};
