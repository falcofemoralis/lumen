import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useNotificationsContext } from 'Context/NotificationsContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect } from 'react';

export const Root = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useServiceContext();
  const { getNotifications } = useNotificationsContext();
  const { checkVersion } = useAppUpdaterContext();

  useEffect(() => {
    checkVersion();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      getNotifications();
    }
  }, [isSignedIn]);

  return children;
};

export default Root;