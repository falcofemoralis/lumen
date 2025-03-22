import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';

import LoginFormComponent from './LoginForm.component';
import LoginFormComponentTV from './LoginForm.component.atv';

export function LoginFormContainer() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      await ServiceStore.login(username.trim(), password.trim());

      NotificationStore.displayMessage(t('Successfully logged in!'));
    } catch (e) {
      NotificationStore.displayError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  if (ServiceStore.isSignedIn) {
    return null;
  }

  const containerFunctions = {
    login,
  };

  const containerProps = () => ({
    isLoading,
  });

  return withTV(LoginFormComponentTV, LoginFormComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default LoginFormContainer;
