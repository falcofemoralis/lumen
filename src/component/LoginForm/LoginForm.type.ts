export interface LoginFormContainerProps {
  withRedirect?: boolean;
}

export interface LoginFormComponentProps {
  isLoading: boolean;
  withRedirect?: boolean;
  login: (username: string, password: string) => void;
}
