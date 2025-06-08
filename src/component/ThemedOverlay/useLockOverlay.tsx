import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useLockSpatialNavigation } from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';

interface UseLockProps {
  isModalVisible: boolean;
  hideModal: () => void;
}

// This hook is used to lock the spatial navigation of parent navigator when a modal is open
// and to prevent the user from closing the modal by pressing the back button
export const useLockOverlay = ({ isModalVisible, hideModal }: UseLockProps) => {
  useLockParentSpatialNavigator(isModalVisible);
  usePreventNavigationGoBack(isModalVisible, hideModal);
};

const useLockParentSpatialNavigator = (isModalVisible: boolean) => {
  const { lock, unlock } = useLockSpatialNavigation();

  useEffect(() => {
    if (isModalVisible) {
      lock();

      return () => {
        unlock();
      };
    }

    return () => {};
  }, [isModalVisible, lock, unlock]);
};

const usePreventNavigationGoBack = (isModalVisible: boolean, hideModal: () => void) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    console.log('usePreventNavigationGoBack', isFocused);

    if (!isFocused) {
      return () => {};
    }

    console.log('set backHandler');

    const backAction = () => {
      console.log('backAction', isModalVisible);

      try {
        if (isModalVisible) {
          hideModal();

          return true;
        }
      } catch (e) {
        NotificationStore.displayError(e as Error);

        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      console.log('remove backHandler');

      backHandler.remove();
    };
  }, [isFocused, isModalVisible, hideModal]);
};
