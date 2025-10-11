import {
  ImageStyle, StyleProp, TextStyle, ViewStyle,
} from 'react-native';

export type Variant = 'filled' | 'outlined' | 'long';

export interface ThemedButtonProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styleFocused?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  rightImageStyle?: StyleProp<ImageStyle>
  isSelected?: boolean;
  IconComponent?: React.ComponentType<any>;
  iconProps?: Record<string, any>;
  variant?: Variant;
  rightImage?: string;
  onPress?: () => void;
  onFocus?: () => void;
  disableRootActive?: boolean;
  disabled?: boolean;
  additionalElement?: (isFocused: boolean, isSelected: boolean) => React.ReactNode;
}
