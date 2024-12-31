import { IconInterface } from 'Component/ThemedIcon/ThemedIcon.type';
import { StyleProp, ViewStyle } from 'react-native';

export type Variant = 'filled' | 'outlined';

export interface ThemedButtonProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isSelected?: boolean;
  icon?: IconInterface;
  variant?: Variant;
  onPress?: () => void;
  onFocus?: () => void;
}
