import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedModalContainerProps {
  id: string;
  onHide: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export interface ThemedModalComponentProps {
  isOpened: boolean;
  isVisible: boolean;
  onHide: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}
