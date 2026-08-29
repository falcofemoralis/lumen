import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import { useCallback } from 'react';
import NotificationStore from 'Store/Notification.store';

import LoginFormComponent from './LoginForm.component';
import LoginFormComponentTV from './LoginForm.component.atv';
import { LoginFormContainerProps } from './LoginForm.type';

export function LoginFormContainer({
  children,
  autofocus,
}: LoginFormContainerProps) {
  const { login, isSignedIn } = useServiceContext();
  const isTV = useIsTV();
  const queryClient = useQueryClient();

  const { mutateAsync: submitLogin, isPending: isLoading } = useMutation({
    mutationFn: ({ username, password }: { username: string, password: string }) => (
      login(username.trim(), password.trim())
    ),
    onSuccess: () => {
      NotificationStore.displayMessage(t('Successfully logged in!'));
      // everything cached so far was fetched as a signed-out user
      queryClient.invalidateQueries();
    },
  });

  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      await submitLogin({ username, password });

      return true;
    } catch {
      // the failure is already reported by the query client
      return false;
    }
  }, [submitLogin]);

  if (isSignedIn) {
    return null;
  }

  const containerProps = {
    isLoading,
    children,
    autofocus,
    handleLogin,
  };

  return isTV ? <LoginFormComponentTV { ...containerProps } /> : <LoginFormComponent { ...containerProps } />;

}

export default LoginFormContainer;
