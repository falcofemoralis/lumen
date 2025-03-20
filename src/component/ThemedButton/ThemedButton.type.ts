import { IconInterface } from 'Component/ThemedIcon/ThemedIcon.type';
import {
  ImageStyle, StyleProp, TextStyle, ViewStyle,
} from 'react-native';

export type Variant = 'filled' | 'outlined';

export interface ThemedButtonProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styleFocused?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<TextStyle>;
  iconStyleFocused?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
  rightImageStyle?: StyleProp<ImageStyle>
  isSelected?: boolean;
  icon?: IconInterface;
  iconSize?: number;
  variant?: Variant;
  rightImage?: string;
  onPress?: () => void;
  onFocus?: () => void;
  disableRootActive?: boolean;
  disabled?: boolean;
}
