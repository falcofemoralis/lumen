import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import RNRestart from 'react-native-restart';
import ConfigStore from 'Store/Config.store';
import LoggerStore from 'Store/Logger.store';

export const useAwake = () => {
  const exitAppStateRef = useRef<number>(0);

  const blurHandler = () => {
    if (ConfigStore.isTV()) {
      exitAppStateRef.current = Date.now();

      LoggerStore.debug('blurHandler', { exitAppStateRef: exitAppStateRef.current });
    }
  };

  const focusHandler = () => {
    if (ConfigStore.isTV()) {
      if (!exitAppStateRef.current) {
        return;
      }

      const blurTime = exitAppStateRef.current;
      const focusTime = Date.now();

      LoggerStore.debug('focusHandler', { blurTime, focusTime });

      if (focusTime - blurTime > 1000 * 60 * 60 * 4) { // 4 hours
        RNRestart.restart();
      }
    }
  };

  useEffect(() => {
    if (!ConfigStore.getConfig().isTVAwake) {
      return () => {};
    }

    const blurSubscription = AppState.addEventListener('blur', blurHandler);
    const focusSubscription = AppState.addEventListener('focus', focusHandler);

    return () => {
      blurSubscription.remove();
      focusSubscription.remove();
    };
  }, []);

  return null;
};