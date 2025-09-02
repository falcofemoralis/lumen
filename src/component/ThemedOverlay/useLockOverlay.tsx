import { useIsFocused } from '@react-navigation/native';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useLockSpatialNavigation } from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';

interface UseLockProps {
  isModalOpened: boolean;
  isModalVisible: boolean;
  hideModal: () => void;
  id: string;
}

// This hook is used to lock the spatial navigation of parent navigator when a modal is open
// and to prevent the user from closing the modal by pressing the back button
export const useLockOverlay = ({ isModalOpened,isModalVisible, hideModal, id }: UseLockProps) => {
  useLockParentSpatialNavigator(isModalOpened, id);
  usePreventNavigationGoBack(isModalVisible, hideModal, id);
};

const useLockParentSpatialNavigator = (isModalOpened: boolean, id: string) => {
  const { lock, unlock } = useLockSpatialNavigation();

  useEffect(() => {
    if (isModalOpened) {
      lock();

      return () => {
        unlock();
      };
    }

    return () => {};
  }, [isModalOpened, lock, unlock]);
};

const usePreventNavigationGoBack = (isModalVisible: boolean, hideModal: () => void, id: string) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      return () => {};
    }

    const backAction = () => {
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
      backHandler.remove();
    };
  }, [isFocused, isModalVisible, hideModal]);
};
