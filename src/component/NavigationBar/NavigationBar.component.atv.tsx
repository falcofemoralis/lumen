import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import ThemedIcon from 'Component/ThemedIcon';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import {
  StyleProp,
  TextStyle,
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
import { scale } from 'Util/CreateStyles';

import { TABS_TV_CONFIG } from './NavigationBar.config';
import { OpeningAnimation, styles } from './NavigationBar.style.atv';
import {
  NavigationBarComponentProps, NavigationType, StateType, Tab,
} from './NavigationBar.type';

export function NavigationBarComponent({
  navigateTo,
  isFocused,
}: NavigationBarComponentProps) {
  const onDirectionHandledWithoutMovement = useCallback((movement: string) => {
    if (movement === Directions.RIGHT) {
      NavigationStore.closeNavigation();
    }
  }, []);

  const renderTab = useCallback((
    tab: Tab<string>,
    navigation: NavigationType,
    state: StateType,
    animatedTextStyle: StyleProp<TextStyle>,
  ) => {
    const { route, title, icon } = tab;
    const focused = isFocused(tab, state);

    return (
      <SpatialNavigationFocusableView
        key={ title }
        onFocus={ () => navigateTo(tab, navigation, state) }
      >
        { ({ isRootActive }) => (
          <View
            style={ [
              styles.tab,
              focused && !isRootActive && styles.tabSelected,
              focused && isRootActive && styles.tabFocused,
            ] }
          >
            { icon && (
              <ThemedIcon
                style={ [
                  styles.tabIcon,
                  focused && isRootActive && styles.tabContentFocused,
                ] }
                icon={ icon }
                size={ scale(24) }
                color="white"
              />
            ) }
            <ThemedText.Animated
              style={ [
                styles.tabText,
                focused && isRootActive && styles.tabContentFocused,
                animatedTextStyle,
              ] }
            >
              { title }
            </ThemedText.Animated>
          </View>
        ) }
      </SpatialNavigationFocusableView>
    );
  }, [navigateTo, isFocused]);

  const renderTabs = useCallback((navigation: NavigationType, state: StateType) => (
    <OpeningAnimation isOpened={ NavigationStore.isNavigationOpened }>
      { ({ animatedOpeningStyle, animatedTextStyle }) => (
        <ThemedView.Animated style={ [styles.tabs, animatedOpeningStyle] }>
          { TABS_TV_CONFIG.map((tab) => renderTab(tab, navigation, state, animatedTextStyle)) }
        </ThemedView.Animated>
      ) }
    </OpeningAnimation>
  ), [renderTab]);

  const renderTabBar = useCallback(({ navigation, state }: BottomTabBarProps) => (
    <SpatialNavigationRoot
      isActive={ NavigationStore.isNavigationOpened }
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
            NavigationStore.isNavigationOpened && styles.barBackgroundOpened,
          ] }
          colors={ ['rgba(0, 0, 0, 0.8)', 'transparent'] }
          start={ { x: 0.5, y: 0 } }
          end={ { x: 1, y: 0 } }
        />
      </ThemedView>
    </SpatialNavigationRoot>
  ), [renderTabs, onDirectionHandledWithoutMovement, NavigationStore.isNavigationOpened]);

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
        // transitionSpec: {
        //   animation: 'timing',
        //   config: {
        //     duration: 2000,
        //     easing: Easing.inOut(Easing.ease),
        //   },
        // },
        // sceneStyleInterpolator: ({ current }) => ({
        //   sceneStyle: {
        //     opacity: current.progress.interpolate({
        //       inputRange: [-1, 0, 1],
        //       outputRange: [0, 1, 0],
        //     }),
        //   },
        // }),
      } }
      tabBar={ renderTabBar }
    />
  );
}

export default observer(NavigationBarComponent);
