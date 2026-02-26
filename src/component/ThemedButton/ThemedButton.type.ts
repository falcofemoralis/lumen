import { Ref } from 'react';
import {
  ImageStyle, StyleProp, TextStyle, ViewStyle,
} from 'react-native';
import { SpatialNavigationNodeRef } from 'react-tv-space-navigation';

export type Variant = 'filled' | 'outlined' | 'long' | 'transparent';

export interface ThemedButtonProps {
  spatialRef?: Ref<SpatialNavigationNodeRef>;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  styleSelected?: StyleProp<ViewStyle>;
  styleFocused?: StyleProp<ViewStyle>;
  styleAdditional?: StyleProp<ViewStyle>;
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
  withAnimation?: boolean;
  zoomScale?: number;
  isFocusVisible?: boolean;
}
