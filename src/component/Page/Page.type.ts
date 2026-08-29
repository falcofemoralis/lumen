import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

export interface PageContainerProps {
  children: Exclude<NonNullable<ReactNode>, string | number | boolean>
  style?: ViewStyle;
  checkConnection?: boolean;
  // TV related
  fullscreen?: boolean;
}

export interface PageComponentProps extends PageContainerProps {
  isConnected?: boolean;
}
