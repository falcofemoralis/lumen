import { Ref } from 'react';
import { PressableStateCallbackType, StyleProp, View, ViewStyle } from 'react-native';

export interface ThemedPressableProps {
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  stateStyle?: (state: PressableStateCallbackType) => StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  mode?: 'light' | 'dark';
  ref?: Ref<View>;
}