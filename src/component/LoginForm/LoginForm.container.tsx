import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';

import LoginFormComponent from './LoginForm.component';
import LoginFormComponentTV from './LoginForm.component.atv';
import { LoginFormContainerProps } from './LoginForm.type';

export function LoginFormContainer({
  withRedirect,
}: LoginFormContainerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login, isSignedIn } = useServiceContext();
  const { isTV } = useConfigContext();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      await login(username.trim(), password.trim());

      NotificationStore.displayMessage(t('Successfully logged in!'));
      setIsLoading(false);

      return true;
    } catch (error) {
      NotificationStore.displayError(error as Error);
      setIsLoading(false);

      return false;
    }
  };

  if (isSignedIn) {
    return null;
  }

  const containerProps = {
    isLoading,
    withRedirect,
    handleLogin,
  };

  return isTV ? <LoginFormComponentTV { ...containerProps } /> : <LoginFormComponent { ...containerProps } />;

}

export default LoginFormContainer;
