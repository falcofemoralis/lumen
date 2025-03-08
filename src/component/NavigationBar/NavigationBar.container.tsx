import { CommonActions } from '@react-navigation/native';
import { useProfile } from 'Hooks/useProfile';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect } from 'react';
import ConfigStore from 'Store/Config.store';

import NavigationBarComponent from './NavigationBar.component';
import NavigationBarComponentTV from './NavigationBar.component.atv';
import { NavigationType, StateType, Tab } from './NavigationBar.type';

export function NavigationBarContainer() {
  const [profile] = useProfile();
  // const badgeData = {};

  // useEffect(() => {
  // }, [NavigationStore.badgeData]);

  const navigateTo = useCallback((
    tab: Tab,
    navigation: NavigationType,
    state: StateType,
  ) => {
    const { route } = tab;

    const routes = Array.from(state.routes);
    const rn = routes.find((r) => r.name === route);

    if (!rn) {
      return;
    }

    // we should unload current row on TV
    if (ConfigStore.isTV) {
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
  }, []);

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
