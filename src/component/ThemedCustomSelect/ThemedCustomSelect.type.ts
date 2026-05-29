import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedCustomSelectComponentProps {
  options: string[];
  value: string;
  asOverlay?: boolean;
  overlayRef?: RefObject<ThemedOverlayRef | null>;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  onSelect: (value: string) => void;
  onClose?: () => void;
}