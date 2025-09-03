import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedOverlayContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  transparent?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onShow?: () => void;
}

export interface ThemedOverlayComponentProps {
  isOpened: boolean;
  isVisible: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  transparent?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onShow?: () => void;
  handleModalRequestClose: () => void;
}

export type ThemedOverlayRef = {
  open: () => void;
  close: () => void;
  hide: () => void;
  show: () => void;
};
