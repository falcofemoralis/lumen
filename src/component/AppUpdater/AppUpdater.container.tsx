import { pause, resume } from '@noriginmedia/norigin-spatial-navigation-core';
import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useIsTV } from 'Context/ConfigContext';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Installer } from 'Util/App/installer';

import AppUpdaterComponent from './AppUpdater.component';
import AppUpdaterComponentTV from './AppUpdater.component.atv';

export const AppUpdaterContainer = () => {
  const { update, isUpdateRejected, resetUpdate } = useAppUpdaterContext();
  const isTV = useIsTV();
  const [isLoading, setIsLoading] = useState(false);
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
      pause();
    }

    setIsLoading(true);

    const url = Platform.OS === 'android' ? downloadAndroidUrl : downloadIosUrl;

    const result = await Installer.downloadAndInstallApk(url, (receivedNum, totalNum) => {
      setProgress(Math.round((receivedNum / totalNum) * 100));
    });

    if (!result) {
      setIsLoading(false);

      if (isTV) {
        resume();
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