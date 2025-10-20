import { Ref } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SpatialNavigationNodeRef } from 'react-tv-space-navigation';

export type ThemedFocusableNodeState = {
  isFocused: boolean;
  isRootActive: boolean;
}

export type ThemedPressableContainerProps ={
  onPress?: () => void;
  onLongPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  children?: React.ReactNode | ((props: ThemedFocusableNodeState) => React.ReactElement);
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  mode?: 'light' | 'dark';
  pressDelay?: number;
  ref?: Ref<View>;
  spatialRef?: Ref<SpatialNavigationNodeRef>;
  additionalElement?: React.ReactNode;
  withAnimation?: boolean;
  zoomScale?: number;
  resolveAsMobile?: boolean;
}

export type ThemedPressableComponentProps = ThemedPressableContainerProps;