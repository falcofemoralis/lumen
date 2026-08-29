import { SettingChangeHandler, SettingCommonProps } from 'Component/SettingBase/SettingBase.type';

export type SettingCustomSelectComponentProps = SettingCommonProps & {
  value: string;
  options: string[];
  onChange: SettingChangeHandler<string>;
};
