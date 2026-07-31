import { SettingChangeHandler, SettingCommonProps } from 'Component/SettingBase/SettingBase.type';

export type SettingInputComponentProps = SettingCommonProps & {
  value: string;
  onChange: SettingChangeHandler<string>;
};
