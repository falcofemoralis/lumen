import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedModalProps {
  visible: boolean;
  onHide: () => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}
