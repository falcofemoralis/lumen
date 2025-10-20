import { createContext, useContext, useMemo, useReducer } from 'react';

/**
 * We store the number of times that we have been asked to lock the navigator
 * to avoid any race conditions
 *
 * It's more reliable than a simple boolean
 */
const lockReducer = (state: number, action: 'lock' | 'unlock'): number => {
  switch (action) {
    case 'lock':
      return state + 1;
    case 'unlock':
      return state - 1;
    default:
      return state;
  }
};

export const useIsLocked = () => {
  const [lockAmount, dispatch] = useReducer(lockReducer, 0);

  const lockActions = useMemo(
    () => ({
      lock: () => dispatch('lock'),
      unlock: () => dispatch('unlock'),
    }),
    [dispatch],
  );

  return {
    isLocked: lockAmount !== 0,
    lockActions,
  };
};

export const LockSpatialNavigationContext = createContext<{
  lock: () => void;
  unlock: () => void;
  isLocked: boolean;
}>({
  lock: () => undefined,
  unlock: () => undefined,
  isLocked: false,
});

export const useLockSpatialNavigation = () => {
  const { lock, unlock, isLocked } = useContext(LockSpatialNavigationContext);
  return { lock, unlock, isLocked };
};
