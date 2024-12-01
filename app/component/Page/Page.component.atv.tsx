import ThemedView from 'Component/ThemedView';
import { useRootNavigationState } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { SpatialNavigationRoot, useLockSpatialNavigation } from 'react-tv-space-navigation';
import NavigationStore from 'Store/Navigation.store';
import { TVEventType } from 'Type/TVEvent.type';
import { ROOT_ROUTE } from '../../navigation/_layout';
import { PageProps } from './Page.type';

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

export function PageComponent(props: PageProps) {
  const { children, name: pageName } = props;
  const { routes } = useRootNavigationState();
  const [isFocused, setIsFocused] = useState(true);

  const onDirectionHandledWithoutMovement = (movement: string) => {
    if (movement === TVEventType.Left) {
      NavigationStore.openNavigation();
    }
  };

  useEffect(() => {
    const hasFocus = () => {
      if (routes.length <= 1) {
        return true;
      }

      const { name = ROOT_ROUTE } = routes[1] ?? {};

      return name === pageName;
    };

    setIsFocused(hasFocus());
  }, [routes, pageName]);

  return (
    <ThemedView>
      <SpatialNavigationRoot
        isActive={!NavigationStore.isNavigationOpened && isFocused}
        onDirectionHandledWithoutMovement={onDirectionHandledWithoutMovement}
      >
        <SpatialNavigationKeyboardLocker />
        {children}
      </SpatialNavigationRoot>
    </ThemedView>
  );
}

export default observer(PageComponent);
