import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  isSelected?: boolean;
}
