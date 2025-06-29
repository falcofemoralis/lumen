import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect } from 'react';

export const Root = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, getNotifications } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();

  useEffect(() => {
    checkVersion();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      getNotifications();
    }
  }, [isSignedIn, getNotifications]);

  return children;
};

export default Root;