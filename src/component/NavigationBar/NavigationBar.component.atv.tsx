import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import { useNavigationContext } from 'Context/NavigationContext';
import { useServiceContext } from 'Context/ServiceContext';
import { Tabs } from 'expo-router';
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
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { setTimeoutSafe } from 'Util/Misc';

import {
  DEFAULT_ROUTE,
  LOADER_ROUTE,
  TABS_TV_CONFIG,
} from './NavigationBar.config';
import { styles } from './NavigationBar.style.atv';
import {
  NavigationBarComponentProps,
  NavigationType,
  StateType,
  Tab,
  TAB_COMPONENT,
  TAB_POSITION,
} from './NavigationBar.type';

export function NavigationBarComponent({
  profile,
  navigateTo,
  isFocused,
}: NavigationBarComponentProps) {
  const { isMenuOpen, toggleMenu } = useNavigationContext();
  const { badgeData } = useServiceContext();
  const { isSignedIn } = useServiceContext();
  const lastPage = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: string) => {
      if (movement === Directions.RIGHT) {
        toggleMenu(false);
      }
    },
    [toggleMenu]
  );

  const onTabSelect = useCallback((
    tab: Tab,
    navigation: NavigationType,
    state: StateType
  ) => {
    if (lastPage.current !== LOADER_ROUTE) {
      setTimeoutSafe(() => {
        navigateTo({ ...tab, route: LOADER_ROUTE }, navigation, state);
      }, 0);
      lastPage.current = LOADER_ROUTE;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeoutSafe(() => {
      navigateTo(tab, navigation, state);
      lastPage.current = tab.route;
    }, 500);
  }, [navigateTo]);

  const renderDefaultTab = useCallback((
    tab: Tab,
    focused: boolean,
    isRootActive: boolean,
    isf: boolean
  ) => {
    const { title, IconComponent } = tab;

    const badge = badgeData[tab.route] ?? 0;

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
          { badge > 0 && (
            <ThemedText style={ styles.badge }>
              { badge }
            </ThemedText>
          ) }
        </View>
        <ThemedText.Animated
          style={ [
            styles.tabText,
            isf && isRootActive && styles.tabContentFocused,
            isMenuOpen && styles.tabTextOpened,
          ] }
        >
          { title }
        </ThemedText.Animated>
      </View>
    );
  }, [isMenuOpen, badgeData]);

  const renderAccountTab = useCallback((
    tab: Tab,
    focused: boolean,
    isRootActive: boolean,
    isf: boolean
  ) => {
    const { title } = tab;
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
          <ThemedText.Animated
            style={ [
              styles.tabText,
              styles.profileNameText,
              isf && isRootActive && styles.tabContentFocused,
              isMenuOpen && styles.tabTextOpened,
            ] }
          >
            { title }
          </ThemedText.Animated>
          <ThemedText.Animated
            style={ [
              styles.tabText,
              styles.profileSwitchText,
              isf && isRootActive && styles.tabContentFocused,
              isMenuOpen && styles.tabTextOpened,
            ] }
          >
            { isSignedIn ? name : t('Sign in') }
          </ThemedText.Animated>
        </View>
      </View>
    );
  }, [isMenuOpen, profile, isSignedIn]);

  const renderTab = useCallback((
    tab: Tab,
    navigation: NavigationType,
    state: StateType
  ) => {
    const { title, tabComponent } = tab;
    const focused = isFocused(tab, state);

    const renderComponent = (isRootActive: boolean, isf: boolean) => {
      switch (tabComponent) {
        case TAB_COMPONENT.ACCOUNT:
          return renderAccountTab(tab, focused, isRootActive, isf);
        default:
          return renderDefaultTab(tab, focused, isRootActive, isf);
      }
    };

    return (
      <DefaultFocus
        key={ title }
        enable={ tab.route === DEFAULT_ROUTE }
      >
        <SpatialNavigationFocusableView
          onFocus={ () => isMenuOpen && onTabSelect(tab, navigation, state) }
        >
          { ({ isRootActive, isFocused: isf }) => (
            renderComponent(isRootActive, isf)
          ) }
        </SpatialNavigationFocusableView>
      </DefaultFocus>
    );
  }, [onTabSelect, isFocused, isMenuOpen, renderAccountTab, renderDefaultTab]);

  const renderTabs = useCallback((navigation: NavigationType, state: StateType) => {
    const topTabs = [] as Tab[];
    const middleTabs = [] as Tab[];
    const bottomTabs = [] as Tab[];

    TABS_TV_CONFIG.forEach((tab) => {
      switch (tab.position) {
        case TAB_POSITION.TOP:
          topTabs.push(tab);
          break;
        case TAB_POSITION.MIDDLE:
          middleTabs.push(tab);
          break;
        case TAB_POSITION.BOTTOM:
          bottomTabs.push(tab);
          break;
        default:
          middleTabs.push(tab);
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
          { topTabs.map((tab) => renderTab(tab, navigation, state)) }
        </View>
        <View>
          { middleTabs.map((tab) => renderTab(tab, navigation, state)) }
        </View>
        <View>
          { bottomTabs.map((tab) => renderTab(tab, navigation, state)) }
        </View>
      </Animated.View>
    );
  }, [renderTab, isMenuOpen]);

  const renderTabBar = useCallback(({ navigation, state }: BottomTabBarProps) => (
    <SpatialNavigationRoot
      isActive={ isMenuOpen }
      onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
    >
      <View style={ styles.bar }>
        <SpatialNavigationView direction="vertical">
          { renderTabs(navigation, state) }
        </SpatialNavigationView>
      </View>
    </SpatialNavigationRoot>
  ), [renderTabs, onDirectionHandledWithoutMovement, isMenuOpen]);

  return (
    <Tabs
      screenOptions={ {
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.white,
        tabBarPosition: 'left',
      } }
      tabBar={ renderTabBar }
    />
  );
}

export default NavigationBarComponent;
