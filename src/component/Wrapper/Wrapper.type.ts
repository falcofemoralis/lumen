import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type WrapperProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};