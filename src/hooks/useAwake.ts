import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import RNRestart from 'react-native-restart';
import ConfigStore from 'Store/Config.store';

export const useAwake = () => {
  const exitAppStateRef = useRef<number>(0);

  const blurHandler = () => {
    if (ConfigStore.isTV()) {
      exitAppStateRef.current = Date.now();
    }
  };

  const focusHandler = () => {
    if (ConfigStore.isTV()) {
      if (!exitAppStateRef.current) {
        return;
      }

      const blurTime = exitAppStateRef.current;
      const focusTime = Date.now();

      if (focusTime - blurTime > 1000 * 60 * 60) { // 1 hour
        RNRestart.restart();
      }
    }
  };

  useEffect(() => {
    const blurSubscription = AppState.addEventListener('blur', blurHandler);
    const focusSubscription = AppState.addEventListener('focus', focusHandler);

    return () => {
      blurSubscription.remove();
      focusSubscription.remove();
    };
  }, []);

  return null;
};