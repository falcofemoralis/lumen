import { CommonActions } from '@react-navigation/native';
import { useServiceContext } from 'Context/ServiceContext';
import { useProfile } from 'Hooks/useProfile';
import { withTV } from 'Hooks/withTV';
import { useCallback } from 'react';
import ConfigStore from 'Store/Config.store';

import NavigationBarComponent from './NavigationBar.component';
import NavigationBarComponentTV from './NavigationBar.component.atv';
import { ACCOUNT_ROUTE, BOOKMARKS_ROUTE, RECENT_ROUTE } from './NavigationBar.config';
import { NavigationType, StateType, Tab } from './NavigationBar.type';

export function NavigationBarContainer() {
  const [profile] = useProfile();
  const { isSignedIn } = useServiceContext();

  const getRedirectRoute = useCallback((tab: Tab) => {
    const { route } = tab;

    // if not signed in, we should redirect to account page
    if (!isSignedIn && (route === BOOKMARKS_ROUTE || route === RECENT_ROUTE)) {
      return ACCOUNT_ROUTE;
    }

    return route;
  }, [isSignedIn]);

  const navigateTo = useCallback((
    tab: Tab,
    navigation: NavigationType,
    state: StateType
  ) => {
    const route = getRedirectRoute(tab);

    const routes = Array.from(state.routes);
    const rn = routes.find((r) => r.name === route);

    if (!rn) {
      return;
    }

    // we should unload current row on TV
    if (ConfigStore.isTV()) {
      navigation.reset({
        index: 0,
        routes: [{ name: rn.name }], // your stack screen name
      });

      return;
    }

    const event = navigation.emit({
      type: 'tabPress',
      target: rn.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.dispatch({
        ...CommonActions.navigate(route),
        target: state.key,
      });
    }
  }, [getRedirectRoute]);

  const isFocused = useCallback((tab: Tab, state: StateType) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.route);

    return state.index === routeIndex;
  }, []);

  const containerProps = {
    profile,
  };

  const containerFunctions = {
    navigateTo,
    isFocused,
  };

  return withTV(NavigationBarComponentTV, NavigationBarComponent, {
    ...containerFunctions,
    ...containerProps,
  });
}

export default NavigationBarContainer;
