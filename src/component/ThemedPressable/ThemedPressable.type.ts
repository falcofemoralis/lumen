import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedPressableProps {
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  mode?: 'light' | 'dark';
}