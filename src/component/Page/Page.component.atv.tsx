import { useIsFocused } from '@react-navigation/native';
import { Portal } from 'Component/ThemedPortal';
import { useNavigationContext } from 'Context/NavigationContext';
import { useCallback, useEffect } from 'react';
import { Keyboard, View } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import Animated from 'react-native-reanimated';
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
    [toggleMenu, isNavigationLocked]
  );

  return (
    <Animated.View
      style={ [
        styles.container,
        isMenuOpen && styles.containerOpened,
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
    </Animated.View>
  );
}

export default PageComponent;
