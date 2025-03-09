import { withTV } from 'Hooks/withTV';
import __ from 'i18n/__';
import { useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';

import AccountPageComponent from './AccountPage.component';

export function AccountPageContainer() {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      await ServiceStore.login(username.trim(), password.trim());

      NotificationStore.displayMessage(__('Successfully logged in!'));
    } catch (e) {
      NotificationStore.displayError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerFunctions = {
    login,
  };

  const containerProps = () => ({
    isLoading,
  });

  return withTV(AccountPageComponent, AccountPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default AccountPageContainer;
