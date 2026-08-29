import { SettingCommonProps } from 'Component/SettingBase/SettingBase.type';
import { SettingItemOption } from 'Component/SettingSelect/SettingSelect.type';
import { ListItem } from 'Component/ThemedMultiList/ThemedMultiList.type';

export type SettingMultiSelectContainerProps = SettingCommonProps & {
  /** The selected option values. */
  values: string[];
  options: SettingItemOption[];
  /** Shown in the list while it has no options at all. */
  noItemsTitle?: string;
  noItemsSubtitle?: string;
  /** Puts a field above the list that narrows the options down by label. */
  withSearch?: boolean;
  onChange: (values: string[]) => void;
};

export type SettingMultiSelectComponentProps =
  Omit<SettingMultiSelectContainerProps, 'onChange' | 'options' | 'values'> & {
    items: ListItem[];
    handleOnChange: (value: string, isChecked: boolean) => void;
  };
