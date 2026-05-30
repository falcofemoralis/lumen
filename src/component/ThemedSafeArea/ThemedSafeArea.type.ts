import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Edge } from 'react-native-safe-area-context';

export interface ThemedSafeAreaComponentProps {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}