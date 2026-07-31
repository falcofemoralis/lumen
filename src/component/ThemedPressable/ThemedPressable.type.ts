import { ReactElement, ReactNode, Ref } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

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
  disabled?: boolean;
  mode?: 'light' | 'dark';
  pressDelay?: number;
  topAdditionalElement?: (state: ThemedFocusableNodeState) => ReactElement | null;
  bottomAdditionalElement?: (state: ThemedFocusableNodeState) => ReactElement | null;
  // TV related
  onFocus?: () => void;
  onBlur?: () => void;
  onEnterPress?: () => void;
  extraProps?: any;
  focusKey?: string;
  autofocus?: boolean;
}

export type ThemedPressableComponentProps = ThemedPressableContainerProps;