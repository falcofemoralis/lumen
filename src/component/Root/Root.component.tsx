import {
  completeHandler,
  getExistingDownloadTasks,
} from '@kesha-antonov/react-native-background-downloader';
import { AppUpdater } from 'Component/AppUpdater';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect } from 'react';
import NotificationStore from 'Store/Notification.store';

export const Root = ({ children }: { children: React.ReactNode }) => {
  const { checkForUpdates } = useConfigContext();
  const { isSignedIn } = useServiceContext();
  const { fetchUserData } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();

  useEffect(() => {
    if (checkForUpdates) {
      checkVersion();
    }
  }, [checkForUpdates, checkVersion]);

  useEffect(() => {
    if (isSignedIn) {
      fetchUserData();
    }
  }, [isSignedIn, fetchUserData]);

  useEffect( () => {
    getExistingDownloadTasks().then(tasks => {
      tasks.forEach(task => {
        task
          .done(() => {
            completeHandler(task.id);
          })
          .error(({ error }) => {
            NotificationStore.displayError(error);
            completeHandler(task.id);
          });
      });
    });
  }, []);

  return (
    <>
      <AppUpdater position='root' />
      { children }
    </>
  );
};

export default Root;