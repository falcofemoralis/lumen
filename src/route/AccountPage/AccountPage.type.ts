export interface AccountPageContainerProps {
  link: string;
}

export interface AccountPageComponentProps {
  isLoading: boolean;
  login: (username: string, password: string) => void;
}
