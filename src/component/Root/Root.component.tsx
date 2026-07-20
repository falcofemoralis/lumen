import {
  completeHandler,
  getExistingDownloadTasks,
} from '@kesha-antonov/react-native-background-downloader';
import { AppUpdater } from 'Component/AppUpdater';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { ReactNode, useEffect } from 'react';
import NotificationStore from 'Store/Notification.store';

export const Root = ({ children }: { children: ReactNode }) => {
  const { checkForUpdates, isLocalLibrary } = useConfigContext();
  const { isSignedIn } = useServiceContext();
  const { fetchUserData } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();
  const { isInternetAvailable } = useNetworkContext();

  useEffect(() => {
    if (checkForUpdates && isInternetAvailable) {
      checkVersion();
    }
  }, [checkForUpdates, checkVersion, isInternetAvailable]);

  useEffect(() => {
    // in local mode notifications derive from the public updates widget, so
    // they are fetched (and the badge recomputed) even while logged out
    if ((isSignedIn || isLocalLibrary) && isInternetAvailable) {
      fetchUserData();
    }
  }, [isSignedIn, isLocalLibrary, fetchUserData, isInternetAvailable]);

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