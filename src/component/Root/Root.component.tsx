import {
  completeHandler,
  getExistingDownloadTasks,
} from '@kesha-antonov/react-native-background-downloader';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect } from 'react';
import NotificationStore from 'Store/Notification.store';

export const Root = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn } = useServiceContext();
  const { fetchUserData } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

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

  return children;
};

export default Root;