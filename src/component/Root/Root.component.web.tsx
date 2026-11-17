import { AppUpdater } from 'Component/AppUpdater';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useSubtitleStyle } from 'Hooks/useSubtitleStyle';
import { completeHandler, getExistingDownloadTasks, setConfig as setDownloaderConfig } from '@kesha-antonov/react-native-background-downloader';
import { runAfterStartup } from 'Util/Startup';
import NotificationStore from 'Store/Notification.store';
import { useNetworkContext } from 'Context/NetworkContext';
import { ReactNode, useEffect } from 'react';
import { Portal } from 'Component/ThemedPortal';
import { CloudflareSolver } from 'Component/CloudflareSolver';
import { ZonaStreamProvider } from 'Component/ZonaStreamProvider';
import { useServiceContext } from 'Context/ServiceContext';
import { useConfigContext } from 'Context/ConfigContext';
export const Root = ({ children }: { children: ReactNode }) => {
  useSubtitleStyle();
  const { fetchUserData, isSignedIn } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();
  const { isConfigured, isLocalLibrary, downloadsMaxParallel, checkForUpdates } = useConfigContext();
  const { isInternetAvailable } = useNetworkContext();
  useEffect(() => { if (isConfigured && checkForUpdates && isInternetAvailable) return runAfterStartup(() => { void checkVersion(); }); return undefined; }, [isConfigured, checkForUpdates, checkVersion, isInternetAvailable]);
  useEffect(() => { if (isConfigured && (isSignedIn || isLocalLibrary) && isInternetAvailable) return runAfterStartup(() => { void fetchUserData(); }); return undefined; }, [isConfigured, isSignedIn, isLocalLibrary, isInternetAvailable, fetchUserData]);
  useEffect(() => { setDownloaderConfig({ maxParallelDownloads: downloadsMaxParallel }); }, [downloadsMaxParallel]);
  useEffect(() => {
    void getExistingDownloadTasks().then(tasks => tasks.forEach(task => {
      task.done(() => completeHandler(task.id)).error(({ error }) => { NotificationStore.displayError(error); completeHandler(task.id); });
    })).catch(error => NotificationStore.displayError(error));
  }, []);
  return <Portal.Host>{children}<AppUpdater /><CloudflareSolver /><ZonaStreamProvider /></Portal.Host>;
};
export default Root;


