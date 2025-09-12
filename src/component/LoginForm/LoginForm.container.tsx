import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import { useState } from 'react';
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';

import LoginFormComponent from './LoginForm.component';
import LoginFormComponentTV from './LoginForm.component.atv';
import { LoginFormContainerProps } from './LoginForm.type';

export function LoginFormContainer({
  withRedirect,
}: LoginFormContainerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isSignedIn } = useServiceContext();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      await login(username.trim(), password.trim());

      NotificationStore.displayMessage(t('Successfully logged in!'));
      setIsLoading(false);

      return true;
    } catch (error) {
      LoggerStore.error('handleLogin', { error });
      NotificationStore.displayError(error as Error);
      setIsLoading(false);

      return false;
    }
  };

  if (isSignedIn) {
    return null;
  }

  const containerFunctions = {
    handleLogin,
  };

  const containerProps = () => ({
    isLoading,
    withRedirect,
  });

  return withTV(LoginFormComponentTV, LoginFormComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default LoginFormContainer;
