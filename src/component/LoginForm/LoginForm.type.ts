export interface LoginFormComponentProps {
  isLoading: boolean;
  login: (username: string, password: string) => void;
}
