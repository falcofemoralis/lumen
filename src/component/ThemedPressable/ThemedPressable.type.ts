import { Ref } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

export interface ThemedPressableProps {
  onPress?: () => void;
  onLongPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  mode?: 'light' | 'dark';
  pressDelay?: number;
  ref?: Ref<View>;
  additionalElement?: React.ReactNode;
}