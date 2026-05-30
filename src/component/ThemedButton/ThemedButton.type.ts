import { ComponentType, ReactNode, Ref } from 'react';
import {
  ImageStyle, StyleProp, TextStyle, ViewStyle,
} from 'react-native';
import { SpatialNavigationNodeRef } from 'react-tv-space-navigation';

export type Variant = 'filled' | 'outlined' | 'long' | 'transparent';

export interface ThemedButtonProps {
  spatialRef?: Ref<SpatialNavigationNodeRef>;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  styleSelected?: StyleProp<ViewStyle>;
  styleFocused?: StyleProp<ViewStyle>;
  styleAdditional?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftImageStyle?: StyleProp<ImageStyle>
  rightImageStyle?: StyleProp<ImageStyle>
  isSelected?: boolean;
  IconComponent?: ComponentType<any>;
  iconProps?: Record<string, any>;
  iconColor?: string;
  iconColorFocused?: string;
  variant?: Variant;
  leftImage?: string;
  rightImage?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  onFocus?: () => void;
  disableRootActive?: boolean;
  disabled?: boolean;
  additionalElement?: (isFocused: boolean, isSelected: boolean) => ReactNode;
  withAnimation?: boolean;
  zoomScale?: number;
  isFocusVisible?: boolean;
}
