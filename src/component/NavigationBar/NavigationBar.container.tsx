import { CommonActions } from '@react-navigation/native';
import { useServiceContext } from 'Context/ServiceContext';
import { useProfile } from 'Hooks/useProfile';
import { withTV } from 'Hooks/withTV';
import { ACCOUNT_ROUTE, BOOKMARKS_ROUTE, NOTIFICATIONS_ROUTE, RECENT_ROUTE } from 'Navigation/routes';
import { useCallback } from 'react';

import NavigationBarComponent from './NavigationBar.component';
import NavigationBarComponentTV from './NavigationBar.component.atv';
import { NavigationBarContainerProps } from './NavigationBar.type';

export function NavigationBarContainer(props: NavigationBarContainerProps) {
  const [profile] = useProfile();
  const { isSignedIn } = useServiceContext();
  const { navigation, state } = props;

  const getRedirectRoute = useCallback((name: string) => {
    // if not signed in, we should redirect to account page
    if (!isSignedIn && (name === BOOKMARKS_ROUTE
      || name === RECENT_ROUTE
      || name === NOTIFICATIONS_ROUTE
    )) {
      return ACCOUNT_ROUTE;
    }

    return name;
  }, [isSignedIn]);

  const onPress = useCallback((name: string) => {
    const route = getRedirectRoute(name);

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
  }, [getRedirectRoute, navigation, state]);

  const onLongPress = useCallback((name: string) => {
    const route = getRedirectRoute(name);

    const routes = Array.from(state.routes);
    const rn = routes.find((r) => r.name === route);

    if (!rn) {
      return;
    }

    navigation.emit({
      type: 'tabLongPress',
      target: rn.key,
    });
  }, [getRedirectRoute, navigation, state]);

  const containerProps = {
    ...props,
    profile,
    onPress,
    onLongPress,
  };

  return withTV(NavigationBarComponentTV, NavigationBarComponent, containerProps);
}

export default NavigationBarContainer;
