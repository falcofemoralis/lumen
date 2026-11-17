import { SettingChangeHandler, SettingCommonProps } from 'Component/SettingBase/SettingBase.type';

export type SettingItemOption = {
  value: string;
  label: string;
};

export type SettingSelectOption = SettingItemOption;

export type SettingSelectComponentProps = SettingCommonProps & {
  value: string;
  options: SettingItemOption[];
  onChange: SettingChangeHandler<string>;
  customValue?: string;
  customInputTitle?: string;
  onCustomChange?: SettingChangeHandler<string>;
  showSelectedValueInSubtitle?: boolean;
};
