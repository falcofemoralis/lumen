import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a stable getter for the most recent value it was rendered with.
 *
 * Use it for values a delayed or long lived callback has to read *at call time*
 * rather than at the time the callback was created - timeouts, subscriptions and
 * gesture handlers. Keeping the ref inside the hook means callers never read
 * `.current` from code that runs during render.
 */
export const useLatest = <T>(value: T): (() => T) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return useCallback(() => ref.current, []);
};

export default useLatest;
