import { CommonActions } from '@react-navigation/native';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useCallback } from 'react';

import NavigationBarComponent from './NavigationBar.component';
import NavigationBarComponentTV from './NavigationBar.component.atv';
import { NavigationBarContainerProps } from './NavigationBar.type';

export function NavigationBarContainer(props: NavigationBarContainerProps) {
  const { profile } = useServiceContext();
  const { isTV } = useConfigContext();
  const { navigation, state } = props;

  const onPress = useCallback((route: string) => {
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
  }, [navigation, state]);

  const onLongPress = useCallback((route: string) => {
    const routes = Array.from(state.routes);
    const rn = routes.find((r) => r.name === route);

    if (!rn) {
      return;
    }

    navigation.emit({
      type: 'tabLongPress',
      target: rn.key,
    });
  }, [navigation, state]);

  const onReload = useCallback(() => {
    const currentRoute = state.routes[state.index];

    navigation.dispatch(
      CommonActions.reset({
        ...state,
        routes: state.routes.map((r) => {
          if (r.key === currentRoute.key) {
            return { name: r.name, key: `${r.name}-${Date.now()}` };
          }

          return r;
        }),
      })
    );
  }, [navigation, state]);

  const containerProps = {
    ...props,
    profile,
    onPress,
    onLongPress,
    onReload,
  };

  return isTV ? <NavigationBarComponentTV { ...containerProps } /> : <NavigationBarComponent { ...containerProps } />;
}

export default NavigationBarContainer;
