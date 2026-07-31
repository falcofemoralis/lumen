import { SettingChangeHandler, SettingCommonProps } from 'Component/SettingBase/SettingBase.type';

export type SettingItemOption = {
  label: string;
  value: string;
}

export type SettingSelectComponentProps = SettingCommonProps & {
  value: string;
  options: SettingItemOption[];
  onChange: SettingChangeHandler<string>;
};
