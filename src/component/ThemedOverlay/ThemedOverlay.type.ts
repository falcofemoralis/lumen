import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedOverlayContainerProps {
  id: string;
  onHide: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export interface ThemedOverlayComponentProps {
  id: string;
  isOpened: boolean;
  isVisible: boolean;
  onHide: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}
