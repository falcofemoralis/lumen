import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import ThemedIcon from 'Component/ThemedIcon';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  View,
} from 'react-native';
import {
  DefaultFocus,
  Directions,
  SpatialNavigationFocusableView,
  SpatialNavigationRoot,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { useMenuContext } from './MenuContext';
import { LOADER_PAGE, TABS_TV_CONFIG } from './NavigationBar.config';
import { styles } from './NavigationBar.style.atv';
import {
  NavigationBarComponentProps,
  NavigationType,
  StateType,
  Tab,
} from './NavigationBar.type';

export function NavigationBarComponent({
  navigateTo,
  isFocused,
}: NavigationBarComponentProps) {
  const { isOpen: isMenuOpen, toggleMenu } = useMenuContext();

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
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, isMenuOpen]);

  const onTabSelect = useCallback((
    tab: Tab<string>,
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

  const renderTab = useCallback((
    tab: Tab<string>,
    navigation: NavigationType,
    state: StateType,
  ) => {
    const { title, icon } = tab;
    const focused = isFocused(tab, state);

    return (
      <SpatialNavigationFocusableView
        key={ title }
        onFocus={ () => onTabSelect(tab, navigation, state) }
      >
        { ({ isRootActive, isFocused: isf }) => (
          <View
            style={ [
              styles.tab,
              focused && !isRootActive && styles.tabSelected,
              isf && isRootActive && styles.tabFocused,
            ] }
          >
            { icon && (
              <ThemedIcon
                style={ [
                  styles.tabIcon,
                  isf && isRootActive && styles.tabContentFocused,
                ] }
                icon={ icon }
                size={ scale(24) }
                color="white"
              />
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
          </View>
        ) }
      </SpatialNavigationFocusableView>
    );
  }, [onTabSelect, isFocused, isMenuOpen]);

  const renderTabs = useCallback((navigation: NavigationType, state: StateType) => (
    <Animated.View style={ [styles.tabs, { width: animatedWidth }] }>
      { TABS_TV_CONFIG.map((tab) => renderTab(tab, navigation, state)) }
    </Animated.View>
  ), [renderTab, animatedWidth]);

  const renderTabBar = useCallback(({ navigation, state }: BottomTabBarProps) => (
    <SpatialNavigationRoot
      isActive={ isMenuOpen }
      onDirectionHandledWithoutMovement={ onDirectionHandledWithoutMovement }
    >
      <ThemedView style={ styles.bar }>
        <SpatialNavigationView direction="vertical">
          <DefaultFocus>
            { renderTabs(navigation, state) }
          </DefaultFocus>
        </SpatialNavigationView>
        <LinearGradient
          style={ [
            styles.barBackground,
            isMenuOpen && styles.barBackgroundOpened,
          ] }
          colors={ ['rgba(0, 0, 0, 0.8)', 'transparent'] }
          start={ { x: 0.5, y: 0 } }
          end={ { x: 1, y: 0 } }
        />
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
          margin: 16,
        },
      } }
      tabBar={ renderTabBar }
    />
  );
}

export default NavigationBarComponent;
