import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { setTimeoutSafe } from 'Util/Misc';

export interface RestartableTimeout {
  /** (Re)starts the timeout, replacing any pending run. */
  start: (callback: () => void, delay: number) => void;
  /** Cancels a pending run, if any. */
  stop: () => void;
}

/**
 * A timeout that can be restarted from event handlers and is always cancelled on
 * unmount, so a queued callback can never run against a torn down component.
 *
 * Both functions are stable and hold the timeout handle inside the hook, which
 * keeps callers free of the timeout ref that would otherwise have to be read
 * from handlers built during render (gestures, worklets).
 */
export const useRestartableTimeout = (): RestartableTimeout => {
  const timeout = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
  }, []);

  const start = useCallback((callback: () => void, delay: number) => {
    stop();

    timeout.current = setTimeoutSafe(callback, delay);
  }, [stop]);

  useEffect(() => stop, [stop]);

  return useMemo(() => ({ start, stop }), [start, stop]);
};

export default useRestartableTimeout;
