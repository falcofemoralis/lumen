import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import ThemedIcon from 'Component/ThemedIcon';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { Tabs } from 'expo-router';
import __ from 'i18n/__';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  View,
} from 'react-native';
import {
  DefaultFocus,
  Directions,
  SpatialNavigationFocusableView,
  SpatialNavigationRoot,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import NavigationStore from 'Store/Navigation.store';
import Colors from 'Style/Colors';
import { CONTENT_WRAPPER_PADDING_TV } from 'Style/Layout';
import { scale } from 'Util/CreateStyles';

import { useMenuContext } from './MenuContext';
import {
  DEFAULT_ROUTE,
  LOADER_PAGE,
  TABS_OPENING_DURATION_TV,
  TABS_TV_CONFIG,
} from './NavigationBar.config';
import { NAVIGATION_BAR_TV_WIDTH, styles } from './NavigationBar.style.atv';
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
  const { isOpen: isMenuOpen, toggleMenu } = useMenuContext();

  const containerWidth = Dimensions.get('window').width;
  const lastPage = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animatedWidth = useRef(
    new Animated.Value(isMenuOpen ? styles.tabsOpened.width : styles.tabs.width),
  ).current;

  const onDirectionHandledWithoutMovement = useCallback(
    (movement: string) => {
      if (movement === Directions.RIGHT) {
        toggleMenu(false);
      }
    },
    [toggleMenu],
  );

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isMenuOpen ? styles.tabsOpened.width : styles.tabs.width,
      duration: TABS_OPENING_DURATION_TV,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, isMenuOpen]);

  const onTabSelect = useCallback((
    tab: Tab,
    navigation: NavigationType,
    state: StateType,
  ) => {
    if (lastPage.current !== LOADER_PAGE) {
      setTimeout(() => {
        navigateTo({ ...tab, route: LOADER_PAGE }, navigation, state);
      }, 0);
      lastPage.current = LOADER_PAGE;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      navigateTo(tab, navigation, state);
      lastPage.current = tab.route;
    }, 500);
  }, [navigateTo]);

  const renderDefaultTab = useCallback((
    tab: Tab,
    focused: boolean,
    isRootActive: boolean,
    isf: boolean,
  ) => {
    const { title, icon } = tab;

    const badge = NavigationStore.badgeData[tab.route] ?? 0;

    return (
      <View
        style={ [
          styles.tab,
          focused && !isRootActive && styles.tabSelected,
          isf && isRootActive && styles.tabFocused,
        ] }
      >
        { icon && (
          <View>
            <ThemedIcon
              style={ [
                styles.tabIcon,
                isf && isRootActive && styles.tabContentFocused,
              ] }
              icon={ icon }
              size={ scale(24) }
              color="white"
            />
            { !isMenuOpen && badge > 0 && (
              <View style={ styles.badge } />
            ) }
          </View>
        ) }
        <ThemedText.Animated
          style={ [
            styles.tabText,
            isf && isRootActive && styles.tabContentFocused,
            isMenuOpen && styles.tabTextOpened,
          ] }
        >
          { title }
        </ThemedText.Animated>
        { badge > 0 && (
          <ThemedText
            style={ [
              styles.badgeText,
              isMenuOpen && styles.tabTextOpened,
            ] }
          >
            { __('New') }
          </ThemedText>
        ) }
      </View>
    );
  }, [isMenuOpen, NavigationStore.badgeData]);

  const renderAccountTab = useCallback((
    tab: Tab,
    focused: boolean,
    isRootActive: boolean,
    isf: boolean,
  ) => {
    const { title } = tab;
    const { avatar } = profile ?? {};

    return (
      <View
        style={ [
          styles.tab,
          focused && !isRootActive && styles.tabSelected,
          isf && isRootActive && styles.tabFocused,
        ] }
      >
        <View
          style={ [
            styles.profileAvatarContainer,
            focused ? styles.profileAvatarFocused : styles.profileAvatarUnfocused,
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
            { __('Switch account') }
          </ThemedText.Animated>
        </View>
      </View>
    );
  }, [isMenuOpen, profile]);

  const renderTab = useCallback((
    tab: Tab,
    navigation: NavigationType,
    state: StateType,
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
      <Animated.View style={ [styles.tabs, { width: animatedWidth }] }>
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
  }, [renderTab, animatedWidth]);

  const renderTabBar = useCallback(({ navigation, state }: BottomTabBarProps) => (
    <SpatialNavigationRoot
      isActive={ isMenuOpen }
      onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
    >
      <ThemedView style={ styles.bar }>
        <SpatialNavigationView direction="vertical">
          { renderTabs(navigation, state) }
        </SpatialNavigationView>
        { /* <LinearGradient
          style={ [
            styles.barBackground,
            isMenuOpen && styles.barBackgroundOpened,
          ] }
          colors={ ['rgba(0, 0, 0, 0.8)', 'transparent'] }
          start={ { x: 0.5, y: 0 } }
          end={ { x: 1, y: 0 } }
        /> */ }
      </ThemedView>
    </SpatialNavigationRoot>
  ), [renderTabs, onDirectionHandledWithoutMovement, isMenuOpen]);

  return (
    <Tabs
      screenOptions={ {
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.white,
        tabBarHideOnKeyboard: true,
        tabBarPosition: 'left',
        freezeOnBlur: true,
        sceneStyle: {
          width: containerWidth - scale(NAVIGATION_BAR_TV_WIDTH) - CONTENT_WRAPPER_PADDING_TV * 2,
          marginRight: CONTENT_WRAPPER_PADDING_TV,
          left: styles.tabs.width * -1 + CONTENT_WRAPPER_PADDING_TV,
          marginLeft: animatedWidth,
        },
      } }
      tabBar={ renderTabBar }
    />
  );
}

export default observer(NavigationBarComponent);
