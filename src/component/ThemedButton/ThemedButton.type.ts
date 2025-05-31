import { JSX } from 'react';
import {
  ImageStyle, StyleProp, TextStyle, ViewStyle,
} from 'react-native';

export type Variant = 'filled' | 'outlined';

export interface ThemedButtonProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styleFocused?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  rightImageStyle?: StyleProp<ImageStyle>
  isSelected?: boolean;
  icon?: JSX.Element;
  variant?: Variant;
  rightImage?: string;
  onPress?: () => void;
  onFocus?: () => void;
  disableRootActive?: boolean;
  disabled?: boolean;
}
