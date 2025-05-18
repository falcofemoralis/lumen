import { useIsFocused } from '@react-navigation/native';
import ThemedView from 'Component/ThemedView';
import { useNavigationContext } from 'Context/NavigationContext';
import { useCallback, useEffect } from 'react';
import { Keyboard } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { Portal } from 'react-native-paper';
import { Directions, SpatialNavigationRoot, useLockSpatialNavigation } from 'react-tv-space-navigation';

import { styles } from './Page.style.atv';
import { PageComponentProps } from './Page.type';

/**
 * Locks/unlocks the navigator when the native keyboard is shown/hidden.
 * Allows for the native focus to take over when the keyboard is open,
 * and to go back to our own system when the keyboard is closed.
 */
const SpatialNavigationKeyboardLocker = () => {
  const lockActions = useLockSpatialNavigation();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      lockActions.lock();
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      lockActions.unlock();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [lockActions]);

  return null;
};

export function PageComponent({
  children,
  style,
}: PageComponentProps) {
  const isFocused = useIsFocused();
  const { isMenuOpen, toggleMenu, isNavigationLocked } = useNavigationContext();

  const isActive = isFocused && !isMenuOpen;

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: string) => {
      if (movement === Directions.LEFT && !isNavigationLocked) {
        toggleMenu(true);
      }
    },
    [toggleMenu, isNavigationLocked],
  );

  return (
    <ThemedView
      style={ [
        styles.container,
        style,
      ] }
    >
      <ErrorBoundary>
        <SpatialNavigationRoot
          isActive={ isActive }
          onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
        >
          <SpatialNavigationKeyboardLocker />
          <Portal.Host>
            { children }
          </Portal.Host>
        </SpatialNavigationRoot>
      </ErrorBoundary>
    </ThemedView>
  );
}

export default PageComponent;
