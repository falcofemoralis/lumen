import { CommonActions } from '@react-navigation/native';
import { withTV } from 'Hooks/withTV';
import { useCallback } from 'react';

import NavigationBarComponent from './NavigationBar.component';
import NavigationBarComponentTV from './NavigationBar.component.atv';
import { NavigationType, StateType, Tab } from './NavigationBar.type';

export function NavigationBarContainer() {
  const navigateTo = useCallback((
    tab: Tab<string>,
    navigation: NavigationType,
    state: StateType,
  ) => {
    const { route } = tab;
    const routes = Array.from(state.routes);
    const rn = routes.find((r) => r.name === route);

    if (!rn) {
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

  const isFocused = useCallback((tab: Tab<string>, state: StateType) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.route);

    return state.index === routeIndex;
  }, []);

  const containerFunctions = {
    navigateTo,
    isFocused,
  };

  return withTV(NavigationBarComponentTV, NavigationBarComponent, {
    ...containerFunctions,
  });
}

export default NavigationBarContainer;
