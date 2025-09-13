import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useNotificationsContext } from 'Context/NotificationsContext';
import { useServiceContext } from 'Context/ServiceContext';
import * as StatusBar from 'expo-status-bar';
import { useAwake } from 'Hooks/useAwake';
import { useEffect } from 'react';
import useNotifications from 'Services/Notifications';
import ConfigStore from 'Store/Config.store';

export const Root = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useServiceContext();
  const { getNotifications } = useNotificationsContext();
  const { startNotificationsTask } = useNotifications();
  const { checkVersion } = useAppUpdaterContext();
  const { startAwake } = useAwake();

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  useEffect(() => {
    if(isSignedIn) {
      getNotifications();
    }
  }, [isSignedIn, getNotifications]);

  useEffect(() => {
    return startNotificationsTask();
  }, [startNotificationsTask]);

  useEffect(() => {
    return startAwake();
  }, [startAwake]);

  useEffect(() => {
    if (ConfigStore.isTV()) {
      StatusBar.setStatusBarHidden(true);
    }
  }, []);

  return children;
};

export default Root;