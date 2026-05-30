import { ComponentType } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type HeaderComponentProps = {
  title?: string;
  style?: StyleProp<ViewStyle>;
  additionalAction?: () => void;
  AdditionalActionIcon?: ComponentType<any>;
  isDeepLink?: boolean;
};