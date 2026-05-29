import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export interface LoginFormContainerProps {
  withRedirect?: boolean;
  children?: ReactNode;
}

export interface LoginFormComponentProps {
  isLoading: boolean;
  withRedirect?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  handleLogin: (username: string, password: string) => Promise<boolean>;
}
