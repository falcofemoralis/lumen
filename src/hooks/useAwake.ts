import { useConfigContext } from 'Context/ConfigContext';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { restartApp } from 'Util/Device';

/** A TV that comes back after this long was walked away from, not paused. */
const RESTART_AFTER_MS = 1000 * 60 * 60 * 4;

/**
 * Restarts the app when a TV returns to it after hours in the background.
 *
 * A TV box never kills a backgrounded app the way a phone does, so the app can come back
 * to a foreground it left half a day ago - with stale sessions, stale listings and a JS
 * heap that has been idling the whole time. Restarting is the cheap way out of all of it.
 *
 * The subscription lives here rather than being handed to the caller: the listeners belong
 * to the setting rather than to whoever mounts the hook, and there is only ever one
 * caller.
 */
export const useAwake = () => {
  const { isTV, isTVAwake } = useConfigContext();
  const exitAppStateRef = useRef<number>(0);

  useEffect(() => {
    if (!isTV || !isTVAwake) {
      return () => {};
    }

    const blurSubscription = AppState.addEventListener('blur', () => {
      exitAppStateRef.current = Date.now();
    });

    const focusSubscription = AppState.addEventListener('focus', () => {
      const blurTime = exitAppStateRef.current;

      // focused without ever having blurred, i.e. this is the app starting up
      if (!blurTime) {
        return;
      }

      if (Date.now() - blurTime > RESTART_AFTER_MS) {
        restartApp();
      }
    });

    return () => {
      blurSubscription.remove();
      focusSubscription.remove();
    };
  }, [isTV, isTVAwake]);
};
