import { ReactElement, ReactNode, Ref } from 'react';
import { AccessibilityRole, Insets, StyleProp, View, ViewStyle } from 'react-native';

export type ThemedFocusableNodeState = {
  isFocused: boolean;
}

export type ThemedPressableContainerProps ={
  onPress?: () => void;
  onLongPress?: () => void;
  children?: ReactNode | ((props: ThemedFocusableNodeState) => ReactElement);
  ref?: Ref<View>;
  style?: StyleProp<ViewStyle> | ((state: ThemedFocusableNodeState) => StyleProp<ViewStyle>);
  contentStyle?: StyleProp<ViewStyle> | ((state: ThemedFocusableNodeState) => StyleProp<ViewStyle>);
  hitSlop?: Insets | number | null;
  disabled?: boolean;
  accessibilityRole?: AccessibilityRole;
  mode?: 'light' | 'dark';
  pressDelay?: number;
  disableRipple?: boolean;
  topAdditionalElement?: (state: ThemedFocusableNodeState) => ReactElement | null;
  bottomAdditionalElement?: (state: ThemedFocusableNodeState) => ReactElement | null;
  // TV related
  onFocus?: () => void;
  onBlur?: () => void;
  onEnterPress?: () => void;
  onArrowPress?: (direction: string) => boolean;
  extraProps?: any;
  focusKey?: string;
  autofocus?: boolean;
  focusOnPress?: boolean;
}

export type ThemedPressableComponentProps = ThemedPressableContainerProps;