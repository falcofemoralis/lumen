import {
  completeHandler,
  getExistingDownloadTasks,
} from '@kesha-antonov/react-native-background-downloader';
import { init } from '@noriginmedia/norigin-spatial-navigation-core';
import { AppUpdater } from 'Component/AppUpdater';
import { Portal } from 'Component/ThemedPortal';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useAwake } from 'Hooks/useAwake';
import { ReactNode, useEffect } from 'react';
import NotificationStore from 'Store/Notification.store';

export const Root = ({ children }: { children: ReactNode }) => {
  const { checkForUpdates, isLocalLibrary } = useConfigContext();
  const { isSignedIn } = useServiceContext();
  const { fetchUserData } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();
  const { isInternetAvailable } = useNetworkContext();
  const { startAwake } = useAwake();

  useEffect(() => {
    return startAwake();
  }, [startAwake]);

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
    // App-wide portal host: the updater sits outside any Page, so its overlay
    // has no page host to portal into. Wrapping both here also keeps the
    // portaled content mounted after { children }, so it paints above the page.
    <Portal.Host>
      <AppUpdater />
      { children }
    </Portal.Host>
  );
};

export default Root;