import { NavigationContext } from '@react-navigation/native';
import { useCallback, useContext, useSyncExternalStore } from 'react';

/**
 * Whether the enclosing navigation screen is the focused route -- `false` while
 * it sits under a pushed screen or in a tab that is not selected, even though it
 * stays mounted and rendered.
 *
 * Safe to use outside a navigator (e.g. inside a portal/overlay, where the
 * navigation context is lost): reports `true`, since there is no screen that
 * could be covering it.
 */
export function useIsScreenFocused() {
  // NavigationContext is undefined when rendered outside a navigator (portals
  // break React context), so read it directly instead of useIsFocused(), which
  // would throw.
  const navigation = useContext(NavigationContext);

  const subscribe = useCallback((onStoreChange: () => void) => {
    if (!navigation) {
      return () => {};
    }

    const unsubscribeFocus = navigation.addListener('focus', onStoreChange);
    const unsubscribeBlur = navigation.addListener('blur', onStoreChange);

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  const getSnapshot = useCallback(() => navigation?.isFocused() ?? true, [navigation]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
