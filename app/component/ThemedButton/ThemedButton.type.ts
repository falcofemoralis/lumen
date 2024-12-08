import { StyleProp, ViewStyle } from 'react-native';

export interface ThemedButtonProps {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
}
