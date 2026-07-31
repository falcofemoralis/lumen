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
import { ReactNode, useEffect } from 'react';
import NotificationStore from 'Store/Notification.store';
import { RemoteControlLayoutAdapter } from 'Util/RemoteControl/RemoteControlLayoutAdapter';

export const Root = ({ children }: { children: ReactNode }) => {
  const { checkForUpdates, isLocalLibrary, isConfigured, isTV } = useConfigContext();
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

  useEffect(() => {
    if (isTV || !isConfigured) {
      init({
        layoutAdapter: RemoteControlLayoutAdapter,
      });
    }
  }, [isTV, isConfigured]);

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