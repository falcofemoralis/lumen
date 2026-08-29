import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface LoginFormContainerProps {
  children?: ReactNode;
  // TV related
  autofocus?: boolean
}

export interface LoginFormComponentProps {
  isLoading: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  handleLogin: (username: string, password: string) => Promise<boolean>;
  // TV related
  autofocus?: boolean;
}
