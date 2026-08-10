import { ComponentType, ReactElement } from 'react';
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface ThemedButtonProps {
  title?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  styleDisabled?: StyleProp<ViewStyle>;
  styleOverride?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  IconComponent?: ComponentType<any>;
  iconProps?: Record<string, any>;
  iconColor?: string;
  leftImage?: string;
  leftImageStyle?: StyleProp<ImageStyle>;
  rightImage?: string;
  rightImageStyle?: StyleProp<ImageStyle>;
  topAdditionalElement?: (isFocused: boolean, isSelected: boolean) => ReactElement | null;
  bottomAdditionalElement?: (isFocused: boolean, isSelected: boolean) => ReactElement | null;
  rightAdditionalElement?: (isFocused: boolean, isSelected: boolean) => ReactElement | null;
  // TV related
  selected?: boolean;
  styleSelected?: StyleProp<ViewStyle>;
  styleFocused?: StyleProp<ViewStyle>;
  textStyleFocused?: StyleProp<TextStyle>;
  iconColorFocused?: string;
  extraProps?: any;
  focusKey?: string;
  autofocus?: boolean;
  onFocus?: () => void;
  onEnterPress?: () => void;
}
