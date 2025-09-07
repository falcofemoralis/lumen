import { NavigationRoute, ParamListBase } from '@react-navigation/native';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import { useNavigationContext } from 'Context/NavigationContext';
import { useNotificationsContext } from 'Context/NotificationsContext';
import { useServiceContext } from 'Context/ServiceContext';
import t from 'i18n/t';
import React, { useCallback, useRef } from 'react';
import {
  Image,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {
  DefaultFocus,
  Directions,
  SpatialNavigationFocusableView,
  SpatialNavigationRoot,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import { ACCOUNT_ROUTE } from 'Route/AccountPage/AccountPage.config';
import { HOME_ROUTE } from 'Route/HomePage/HomePage.config';
import { SETTINGS_ROUTE } from 'Route/SettingsPage/SettingsPage.config';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { setTimeoutSafe } from 'Util/Misc';

import { styles } from './NavigationBar.style.atv';
import {
  NavigationBarComponentProps,
} from './NavigationBar.type';

export function NavigationBarComponent({
  state,
  descriptors,
  profile,
  onPress,
}: NavigationBarComponentProps) {
  const { isMenuOpen, toggleMenu } = useNavigationContext();
  const { isSignedIn } = useServiceContext();
  const { badgeData } = useNotificationsContext();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: string) => {
      if (movement === Directions.RIGHT) {
        toggleMenu(false);
      }
    },
    [toggleMenu]
  );

  const onTabSelect = useCallback((name: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeoutSafe(() => {
      onPress(name);
    }, 750);
  }, [onPress]);

  const renderDefaultTab = (
    route: NavigationRoute<ParamListBase, string>,
    focused: boolean,
    isRootActive: boolean,
    isf: boolean
  ) => {
    const { options } = descriptors[route.key] ?? {};
    const { tabBarIcon: IconComponent } = options as { tabBarIcon: React.ComponentType<any> };
    const { tabBarLabel } = options;
    const badgeCount = badgeData[route.name] || 0;

    return (
      <View
        style={ [
          styles.tab,
          focused && !isRootActive && styles.tabSelected,
          isf && isRootActive && styles.tabFocused,
        ] }
      >
        <View>
          { IconComponent && (
            <IconComponent
              style={ styles.tabIcon }
              size={ scale(20) }
              color={ isf && isRootActive ? Colors.black : Colors.white }
            />
          ) }
          { badgeCount > 0 && (
            <ThemedText style={ styles.badge }>
              { badgeCount }
            </ThemedText>
          ) }
        </View>
        <ThemedText
          style={ [
            styles.tabText,
            isf && isRootActive && styles.tabContentFocused,
          ] }
        >
          { typeof tabBarLabel === 'function'
            ? tabBarLabel({
              focused,
              color: isf && isRootActive ? Colors.black : Colors.white,
              position: 'below-icon',
              children: '',
            }) : tabBarLabel }
        </ThemedText>
      </View>
    );
  };

  const renderAccountTab = (
    route: NavigationRoute<ParamListBase, string>,
    focused: boolean,
    isRootActive: boolean,
    isf: boolean
  ) => {
    const { options } = descriptors[route.key] ?? {};
    const { tabBarLabel } = options;
    const { avatar, name } = profile ?? {};

    return (
      <View
        style={ [
          styles.tab,
          focused && !isRootActive && styles.tabSelected,
          isf && isRootActive && styles.tabFocused,
        ] }
      >
        <View style={ styles.profileAvatarContainer }>
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
        </View>
        <View style={ styles.profile }>
          <ThemedText
            style={ [
              styles.tabText,
              styles.profileNameText,
              isf && isRootActive && styles.tabContentFocused,
            ] }
          >
            { typeof tabBarLabel === 'function'
              ? tabBarLabel({
                focused,
                color: isf && isRootActive ? Colors.black : Colors.white,
                position: 'below-icon',
                children: '',
              }) : tabBarLabel }
          </ThemedText>
          <ThemedText
            style={ [
              styles.tabText,
              styles.profileSwitchText,
              isf && isRootActive && styles.tabContentFocused,
            ] }
          >
            { isSignedIn ? name : t('Sign in') }
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderTab = (
    route: NavigationRoute<ParamListBase, string>,
    index: number
  ) => {
    const { name } = route;
    const isFocused = state.index === index;

    const renderComponent = (isRootActive: boolean, isf: boolean) => {
      switch (name) {
        case ACCOUNT_ROUTE:
          return renderAccountTab(route, isFocused, isRootActive, isf);
        default:
          return renderDefaultTab(route, isFocused, isRootActive, isf);
      }
    };

    return (
      <DefaultFocus
        key={ name }
        enable={ name === HOME_ROUTE }
      >
        <SpatialNavigationFocusableView
          onFocus={ () => {
            if (isMenuOpen) {
              onTabSelect(name);
            }
          } }
          onSelect={ () => onTabSelect(name) }
        >
          { ({ isRootActive, isFocused: isf }) => (
            renderComponent(isRootActive, isf)
          ) }
        </SpatialNavigationFocusableView>
      </DefaultFocus>
    );
  };

  const renderTabs = () => {
    const topTabs = [] as { route: NavigationRoute<ParamListBase, string>, index: number }[];
    const middleTabs = [] as { route: NavigationRoute<ParamListBase, string>, index: number }[];
    const bottomTabs = [] as { route: NavigationRoute<ParamListBase, string>, index: number }[];

    state.routes.forEach((route, index) => {
      switch (route.name) {
        case ACCOUNT_ROUTE:
          topTabs.push({ route, index });
          break;
        case SETTINGS_ROUTE:
          bottomTabs.push({ route, index });
          break;
        default:
          middleTabs.push({ route, index });
          break;
      }
    });

    return (
      <Animated.View
        style={ [
          styles.tabs,
          isMenuOpen && styles.tabsOpened,
        ] }
      >
        <View>
          { topTabs.map(({ route, index }) => renderTab(route, index)) }
        </View>
        <View>
          { middleTabs.map(({ route, index }) => renderTab(route, index)) }
        </View>
        <View>
          { bottomTabs.map(({ route, index }) => renderTab(route, index)) }
        </View>
      </Animated.View>
    );
  };

  return (
    <SpatialNavigationRoot
      isActive={ isMenuOpen }
      onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
    >
      <View style={ styles.bar }>
        <SpatialNavigationView direction="vertical">
          { renderTabs() }
        </SpatialNavigationView>
      </View>
    </SpatialNavigationRoot>
  );
}

export default NavigationBarComponent;
