import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useNotificationsContext } from 'Context/NotificationsContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as StatusBar from 'expo-status-bar';
import { useAwake } from 'Hooks/useAwake';
import { useEffect } from 'react';
import ConfigStore from 'Store/Config.store';

export const Root = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useServiceContext();
  const { getNotifications } = useNotificationsContext();
  const { checkVersion } = useAppUpdaterContext();

  useAwake();

  useEffect(() => {
    checkVersion();
  }, []);

  useEffect(() => {
    getNotifications();
  }, [isSignedIn]);

  useEffect(() => {
    if (ConfigStore.isTV()) {
      StatusBar.setStatusBarHidden(true);
    }
  }, []);

  return children;
};

export default Root;