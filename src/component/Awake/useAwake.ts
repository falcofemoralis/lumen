import { useConfigContext } from 'Context/ConfigContext';
import { useRef } from 'react';
import { AppState } from 'react-native';
import RNRestart from 'react-native-restart';

export const useAwake = () => {
  const { isTV, isTVAwake } = useConfigContext();
  const exitAppStateRef = useRef<number>(0);

  const blurHandler = () => {
    if (isTV) {
      exitAppStateRef.current = Date.now();
    }
  };

  const focusHandler = () => {
    if (isTV) {
      if (!exitAppStateRef.current) {
        return;
      }

      const blurTime = exitAppStateRef.current;
      const focusTime = Date.now();

      if (focusTime - blurTime > 1000 * 60 * 60 * 4) { // 4 hours
        RNRestart.restart();
      }
    }
  };

  const startAwake = () => {
    if (!isTVAwake) {
      return () => {};
    }

    const blurSubscription = AppState.addEventListener('blur', blurHandler);
    const focusSubscription = AppState.addEventListener('focus', focusHandler);

    return () => {
      blurSubscription.remove();
      focusSubscription.remove();
    };
  };

  return { startAwake };
};