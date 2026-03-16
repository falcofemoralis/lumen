import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useConfigContext } from 'Context/ConfigContext';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useLockSpatialNavigation } from 'react-tv-space-navigation';
import { Installer } from 'Util/App/installer';

import AppUpdaterComponent from './AppUpdater.component';
import AppUpdaterComponentTV from './AppUpdater.component.atv';
import { AppUpdaterContainerProps } from './AppUpdater.type';;

export const AppUpdaterContainer = ({ position }: AppUpdaterContainerProps) => {
  const { update, isUpdateRejected, resetUpdate } = useAppUpdaterContext();
  const { isTV } = useConfigContext();
  const [isLoading, setIsLoading] = useState(false);
  const { lock, unlock } = useLockSpatialNavigation();
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const bottomSheetRef = useRef<ThemedBottomSheetRef>(null);

  const openPopup = () => {
    if (isTV) {
      overlayRef.current?.open();
    } else {
      bottomSheetRef.current?.present();
    }
  };

  const closePopup = () => {
    if (isTV) {
      overlayRef.current?.close();
    } else {
      bottomSheetRef.current?.dismiss();
    }

    setTimeout(() => {
      requestAnimationFrame(() => {
        resetUpdate();
      });
    }, 0);
  };

  useEffect(() => {
    if (update) {
      setTimeout(() => {
        openPopup();
      }, 0);
    }
  }, [update]);

  if (isTV) {
    if (position === 'root') {
      return null;
    }
  } else {
    if (position === 'page') {
      return null;
    }
  }

  if (!update || isUpdateRejected) {
    return null;
  }

  const acceptUpdate = async () => {
    const {
      downloadAndroidUrl,
      downloadIosUrl,
    } = update;

    if (isLoading) {
      return;
    }

    if (isTV) {
      lock();
    }

    setIsLoading(true);

    const url = Platform.OS === 'android' ? downloadAndroidUrl : downloadIosUrl;

    const result = await Installer.downloadAndInstallApk(url, (receivedNum, totalNum) => {
      setProgress(Math.round((receivedNum / totalNum) * 100));
    });

    if (!result) {
      setIsLoading(false);

      if (isTV) {
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
  };

  return isTV ? <AppUpdaterComponentTV { ...containerProps } /> : <AppUpdaterComponent { ...containerProps } />;
};

export default AppUpdaterContainer;