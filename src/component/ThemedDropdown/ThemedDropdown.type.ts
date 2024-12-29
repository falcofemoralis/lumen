import { DropdownProps } from 'react-native-element-dropdown/lib/typescript/components/Dropdown/model';

export type ThemedDropdownProps = Omit<DropdownProps<DropdownItem>, 'labelField' | 'valueField' | 'renderItem'>;

export interface DropdownItem {
  label: string;
  value: string;
  startIcon?: string;
  endIcon?: string;
}
