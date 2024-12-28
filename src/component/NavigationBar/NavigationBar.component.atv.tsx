import { BottomTabBarProps, BottomTabNavigationEventMap } from '@react-navigation/bottom-tabs';
import {
  CommonActions,
  NavigationHelpers,
  ParamListBase,
  TabNavigationState,
} from '@react-navigation/native';
import ThemedIcon from 'Component/ThemedIcon';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useCallback, useState } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
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

import { Tab, TABS_TV_CONFIG } from './NavigationBar.config';
import { OpeningAnimation, styles } from './NavigationBar.style.atv';

type NavigationType = NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
type StateType = TabNavigationState<ParamListBase>;

export function NavigationBarComponent() {
  const [selectedTab, setSelectedTab] = useState(
    TABS_TV_CONFIG.find((tab) => tab.isDefault)?.route ?? '',
  );

  const onDirectionHandledWithoutMovement = useCallback((movement: string) => {
    if (movement === Directions.RIGHT) {
      NavigationStore.closeNavigation();
    }
  }, []);

  const onFocus = useCallback((tab: Tab<string>, navigation: NavigationType, state: StateType) => {
    const { route } = tab;

    if (route === selectedTab) {
      return;
    }

    setSelectedTab(route);

    setTimeout(() => {
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
    });
  }, [selectedTab]);

  const renderTab = useCallback((
    tab: Tab<string>,
    navigation: NavigationType,
    state: StateType,
    animatedTextStyle: StyleProp<TextStyle>,
  ) => {
    const { route, title, icon } = tab;

    return (
      <SpatialNavigationFocusableView
        key={ title }
        onFocus={ () => onFocus(tab, navigation, state) }
      >
        { ({ isRootActive }) => (
          <View
            style={ [
              styles.tab,
              selectedTab === route && !isRootActive && styles.tabSelected,
              selectedTab === route && isRootActive && styles.tabFocused,
            ] }
          >
            { icon && (
              <ThemedIcon
                style={ [
                  styles.tabIcon,
                  selectedTab === route && isRootActive && styles.tabContentFocused,
                ] }
                icon={ icon }
                size={ scale(24) }
                color="white"
              />
            ) }
            <ThemedText.Animated
              style={ [
                styles.tabText,
                selectedTab === route && isRootActive && styles.tabContentFocused,
                animatedTextStyle,
              ] }
            >
              { title }
            </ThemedText.Animated>
          </View>
        ) }
      </SpatialNavigationFocusableView>
    );
  }, [onFocus, selectedTab]);

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
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.white,
        tabBarHideOnKeyboard: true,
        tabBarPosition: 'left',
      } }
      tabBar={ () => null }
      // tabBar={ renderTabBar }
    />
  );
}

export default observer(NavigationBarComponent);
