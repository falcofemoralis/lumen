import { NavigationRoute, ParamListBase } from '@react-navigation/native';
import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { useServiceContext } from 'Context/ServiceContext';
import React, { useCallback } from 'react';
import {
  Image,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCOUNT_ROUTE } from 'Route/AccountPage/AccountPage.config';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles, TAB_ADDITIONAL_SIZE } from './NavigationBar.style';
import {
  NavigationBarComponentProps,
} from './NavigationBar.type';

export function NavigationBarComponent({
  state,
  descriptors,
  profile,
  onPress,
  onLongPress,
}: NavigationBarComponentProps) {
  const { badgeData } = useServiceContext();
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();

  const renderDefaultTab = useCallback((
    route: NavigationRoute<ParamListBase, string>,
    focused: boolean
  ) => {
    const { options } = descriptors[route.key] ?? {};
    const { tabBarIcon: IconComponent } = options as { tabBarIcon: React.ComponentType<any> };

    return (
      <Animated.View style={ [styles.tab, focused && styles.tabFocused] }>
        { IconComponent && (
          <IconComponent
            style={ styles.tabIcon }
            size={ scale(24) }
            color={ Colors.white }
          />
        ) }
      </Animated.View>
    );
  }, [descriptors]);

  const renderAccountTab = useCallback((
    route: NavigationRoute<ParamListBase, string>,
    focused: boolean
  ) => {
    const { avatar } = profile ?? {};
    const badgeCount = badgeData[route.name] || 0;

    return (
      <Animated.View style={ [styles.tab, styles.tabAccount] }>
        <Animated.View
          style={ [
            styles.profileAvatarContainer,
            focused && styles.profileAvatarFocused,
          ] }
        >
          { avatar ? (
            <ThemedImage
              src={ avatar }
              style={ styles.profileAvatar }
            />
          ) : (
            <Image
              source={ require('../../../assets/images/no_avatar.png') }
              style={ styles.profileAvatar }
            />
          ) }
          { badgeCount > 0 && (
            <ThemedText style={ styles.badge }>
              { badgeCount }
            </ThemedText>
          ) }
        </Animated.View>
      </Animated.View>
    );
  }, [profile, badgeData]);

  const renderTab = useCallback((
    route: NavigationRoute<ParamListBase, string>,
    index: number
  ) => {
    const { name } = route;
    const isFocused = state.index === index;

    const renderComponent = () => {
      switch (name) {
        case ACCOUNT_ROUTE:
          return renderAccountTab(route, isFocused);
        default:
          return renderDefaultTab(route, isFocused);
      }
    };

    return (
      <ThemedPressable
        key={ name }
        style={ [styles.tabContainer, {
          width: (width / state.routes.length) + scale(TAB_ADDITIONAL_SIZE),
          left: index * (width / state.routes.length) - scale(TAB_ADDITIONAL_SIZE / 2),
        }] }
        onPress={ () => onPress(name) }
        onLongPress={ () => onLongPress(name) }
        pressDelay={ 0 }
      >
        { renderComponent() }
      </ThemedPressable>
    );
  }, [renderAccountTab, renderDefaultTab, width, onPress, onLongPress, state]);

  return (
    <View style={ [styles.tabBar, { paddingBottom: bottom }] }>
      <View style={ styles.tabs }>
        { state.routes.map((route, i) => renderTab(route, i)) }
      </View>
    </View>
  );
}

export default NavigationBarComponent;
