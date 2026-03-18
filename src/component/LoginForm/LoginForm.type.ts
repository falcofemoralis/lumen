import { StyleProp, ViewStyle } from 'react-native';

export interface LoginFormContainerProps {
  withRedirect?: boolean;
  children?: React.ReactNode;
}

export interface LoginFormComponentProps {
  isLoading: boolean;
  withRedirect?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  handleLogin: (username: string, password: string) => Promise<boolean>;
}
