import { StyleProp, ViewStyle } from 'react-native';

export type ThemedDropdownContainerProps<T> = {
  data: T[],
  value: T,
  header?: string;
  inputStyle?: StyleProp<ViewStyle>;
  asOverlay?: boolean;
  overlayId?: string;
  asList?: boolean;
  onChange: (value: T) => void;
  inputLabel?: string;
}

export type ThemedDropdownComponentProps<T> = ThemedDropdownContainerProps<T>;

export interface DropdownItem {
  label: string;
  value: string;
  startIcon?: string;
  endIcon?: string;
}
