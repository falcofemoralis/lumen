import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useOverlayContext } from 'Context/OverlayContext';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import hotUpdate from 'react-native-ota-hot-update';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';

import AppUpdaterComponent from './AppUpdater.component';
import AppUpdaterComponentTV from './AppUpdater.component.atv';
import { OVERLAY_APP_UPDATE_ID } from './AppUpdater.config';

export const AppUpdaterContainer = () => {
  const { update, isUpdateRejected, setIsUpdateRejected } = useAppUpdaterContext();
  const { openOverlay, closeOverlay } = useOverlayContext();
  const [isLoading, setIsLoading] = useState(false);
  const bottomSheetRef = useRef<ThemedBottomSheetRef>(null);

  const openPopup = () => {
    if (ConfigStore.isTV()) {
      openOverlay(OVERLAY_APP_UPDATE_ID);
    } else {
      bottomSheetRef.current?.present();
    }
  };

  const closePopup = () => {
    if (ConfigStore.isTV()) {
      closeOverlay(OVERLAY_APP_UPDATE_ID);
    } else {
      bottomSheetRef.current?.dismiss();
    }

    setIsUpdateRejected(true);
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
      version,
      downloadAndroidUrl,
      downloadIosUrl,
    } = update;

    setIsLoading(true);

    const url = Platform.OS === 'android' ? downloadAndroidUrl : downloadIosUrl;

    hotUpdate.downloadBundleUri(ReactNativeBlobUtil, url, version, {
      updateFail(message?: string) {
        setIsLoading(false);
        NotificationStore.displayError(message || 'Bundle update failed');
      },
      restartAfterInstall: true,
      metadata: {
        skipUpdate: false,
        version,
      },
    });
  };

  const rejectUpdate = () => {
    closePopup();
  };

  const skipUpdate = () => {
    const { version } = update;

    closePopup();

    hotUpdate.setUpdateMetadata({
      skipUpdate: true,
      version,
    });
  };

  const containerProps = {
    update,
    isLoading,
    bottomSheetRef,
    acceptUpdate,
    rejectUpdate,
    skipUpdate,
    onBottomSheetMount,
  };

  return withTV(AppUpdaterComponentTV, AppUpdaterComponent, containerProps);
};

export default AppUpdaterContainer;