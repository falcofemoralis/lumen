import { StyleProp, ViewStyle } from 'react-native';

export interface LoginFormContainerProps {
  withRedirect?: boolean;
}

export interface LoginFormComponentProps {
  isLoading: boolean;
  withRedirect?: boolean;
  style?: StyleProp<ViewStyle>;
  handleLogin: (username: string, password: string) => void;
}
