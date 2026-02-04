import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface PageContainerProps {
  children: Exclude<NonNullable<ReactNode>, string | number | boolean>
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  fullscreen?: boolean;
}

export interface PageComponentProps extends PageContainerProps {
}
