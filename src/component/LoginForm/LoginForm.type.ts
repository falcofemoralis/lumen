export interface LoginFormContainerProps {
  withRedirect?: boolean;
}

export interface LoginFormComponentProps {
  isLoading: boolean;
  withRedirect?: boolean;
  handleLogin: (username: string, password: string) => void;
}
