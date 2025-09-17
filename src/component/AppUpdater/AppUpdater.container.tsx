import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useLockSpatialNavigation } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import LoggerStore from 'Store/Logger.store';
import { Installer } from 'Util/App/installer';

import AppUpdaterComponent from './AppUpdater.component';
import AppUpdaterComponentTV from './AppUpdater.component.atv';

export const AppUpdaterContainer = () => {
  const { update, isUpdateRejected, resetUpdate } = useAppUpdaterContext();
  const [isLoading, setIsLoading] = useState(false);
  const { lock, unlock } = useLockSpatialNavigation();
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const bottomSheetRef = useRef<ThemedBottomSheetRef>(null);

  const openPopup = () => {
    if (ConfigStore.isTV()) {
      overlayRef.current?.open();
    } else {
      bottomSheetRef.current?.present();
    }
  };

  const closePopup = () => {
    if (!ConfigStore.isTV()) {
      bottomSheetRef.current?.dismiss();
    }

    resetUpdate();
  };

  useEffect(() => {
    if (update && ConfigStore.isTV()) {
      setTimeout(() => {
        openPopup();
      }, 0);
    }
  }, [update]);

  if (!update || isUpdateRejected) {
    return null;
  }

  const onBottomSheetMount = () => {
    openPopup();
  };

  const acceptUpdate = async () => {
    const {
      downloadAndroidUrl,
      downloadIosUrl,
    } = update;

    if (isLoading) {
      return;
    }

    if (ConfigStore.isTV()) {
      lock();
    }

    setIsLoading(true);

    const url = Platform.OS === 'android' ? downloadAndroidUrl : downloadIosUrl;

    const result = await Installer.downloadAndInstallApk(url, (receivedNum, totalNum) => {
      setProgress(Math.round((receivedNum / totalNum) * 100));
    });

    if (!result) {
      setIsLoading(false);

      if (ConfigStore.isTV()) {
        unlock();
      }

      return;
    }
  };

  const rejectUpdate = () => {
    closePopup();
  };

  const containerProps = {
    update,
    isLoading,
    overlayRef,
    bottomSheetRef,
    progress,
    acceptUpdate,
    rejectUpdate,
    onBottomSheetMount,
  };

  return withTV(AppUpdaterComponentTV, AppUpdaterComponent, containerProps);
};

export default AppUpdaterContainer;