import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useLockSpatialNavigation } from 'react-tv-space-navigation';

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
  }, [isModalVisible, lock, unlock]);
};

const usePreventNavigationGoBack = (isModalVisible: boolean, hideModal: () => void) => {
  useEffect(() => {
    const backAction = () => {
      if (isModalVisible) {
        hideModal();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });
};
