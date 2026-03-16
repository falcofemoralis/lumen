import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useLockSpatialNavigation } from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';

import { ANIMATION_DURATION } from './ThemedOverlay.style.atv';

interface UseLockProps {
  isModalOpened: boolean;
  isModalVisible: boolean;
  hideModal: () => void;
}

// This hook is used to lock the spatial navigation of parent navigator when a modal is open
// and to prevent the user from closing the modal by pressing the back button
export const useLockOverlay = ({ isModalOpened, isModalVisible, hideModal }: UseLockProps) => {
  useLockParentSpatialNavigator(isModalOpened);
  usePreventNavigationGoBack(isModalVisible, hideModal);
};

const useLockParentSpatialNavigator = (isModalOpened: boolean) => {
  const { lock, unlock } = useLockSpatialNavigation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOpenedRef = useRef(isModalOpened);

  useEffect(() => {
    clearTimeout(timeoutRef.current!);

    if (isModalOpened) {
      isOpenedRef.current = true;
      timeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          lock();
        });
      }, ANIMATION_DURATION);

      return () => {};
    }

    if (isOpenedRef.current) {
      isOpenedRef.current = false;
      timeoutRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          unlock();
        });
      }, ANIMATION_DURATION);
    }

    return () => {};
  }, [isModalOpened, lock, unlock]);
};

const usePreventNavigationGoBack = (isModalVisible: boolean, hideModal: () => void) => {
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
      } catch (error) {
        NotificationStore.displayError(error as Error);

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
