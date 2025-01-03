import { useIsFocused } from '@react-navigation/native';
import ThemedView from 'Component/ThemedView';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Keyboard } from 'react-native';
import { Portal } from 'react-native-paper';
import { Directions, SpatialNavigationRoot, useLockSpatialNavigation } from 'react-tv-space-navigation';
import NavigationStore from 'Store/Navigation.store';
import { getWindowWidth } from 'Util/Window';

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

const onDirectionHandledWithoutMovement = (movement: string) => {
  if (movement === Directions.LEFT && !NavigationStore.isNavigationLocked) {
    NavigationStore.openNavigation();
  }
};

export function PageComponent({
  children,
  style,
}: PageComponentProps) {
  const isFocused = useIsFocused();

  const isActive = isFocused && !NavigationStore.isNavigationOpened;

  return (
    <ThemedView
      style={ [
        styles.container,
        NavigationStore.isNavigationLocked
          ? styles.fullContainer
          : { width: getWindowWidth() },
        style,
      ] }
    >
      <SpatialNavigationRoot
        isActive={ isActive }
        onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
      >
        <SpatialNavigationKeyboardLocker />
        <Portal.Host>
          { children }
        </Portal.Host>
      </SpatialNavigationRoot>
    </ThemedView>
  );
}

export default observer(PageComponent);
