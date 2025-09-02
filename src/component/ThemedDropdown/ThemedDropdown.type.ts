import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { StyleProp, ViewStyle } from 'react-native';

export interface DropdownItem {
  label: string;
  value: string;
  startIcon?: string;
  endIcon?: string;
}

export type ThemedDropdownContainerProps = {
  data: DropdownItem[],
  value?: string,
  header?: string;
  inputStyle?: StyleProp<ViewStyle>;
  asOverlay?: boolean;
  overlayRef?: React.RefObject<ThemedOverlayRef | null>;
  onChange: (item: DropdownItem) => void;
  inputLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export type ThemedDropdownComponentProps = ThemedDropdownContainerProps;
