import { useIsFocused } from '@react-navigation/native';
import { TABS_OPENING_DURATION_TV } from 'Component/NavigationBar/NavigationBar.config';
import { NAVIGATION_BAR_TV_WIDTH,styles as navBarStyles } from 'Component/NavigationBar/NavigationBar.style.atv';
import { Portal } from 'Component/ThemedPortal';
import ThemedView from 'Component/ThemedView';
import { useNavigationContext } from 'Context/NavigationContext';
import { useCallback, useEffect } from 'react';
import { Dimensions, Keyboard, View } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { Directions, SpatialNavigationRoot, useLockSpatialNavigation } from 'react-tv-space-navigation';
import { CONTENT_WRAPPER_PADDING_TV } from 'Style/Layout';
import { scale } from 'Util/CreateStyles';

import { styles } from './Page.style.atv';
import { PageComponentProps } from './Page.type';

const containerWidth = Dimensions.get('window').width;

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
    <ThemedView.Animated
      style={ {
        width: containerWidth - scale(NAVIGATION_BAR_TV_WIDTH) - CONTENT_WRAPPER_PADDING_TV * 2,
        marginRight: CONTENT_WRAPPER_PADDING_TV,
        left: navBarStyles.tabs.width * -1 + CONTENT_WRAPPER_PADDING_TV,
        marginLeft: isMenuOpen ? navBarStyles.tabsOpened.width : navBarStyles.tabs.width,
        transitionProperty: 'marginLeft',
        transitionDuration: 250
      } }
    >
      <View
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
      </View>
    </ThemedView.Animated>
  );
}

export default PageComponent;
