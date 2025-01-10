import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import ThemedIcon from 'Component/ThemedIcon';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { Tabs } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Pressable,
  View,
} from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { TABS_MOBILE_CONFIG } from './NavigationBar.config';
import { styles } from './NavigationBar.style';
import {
  NavigationBarComponentProps, NavigationType, StateType, Tab,
} from './NavigationBar.type';

export { Tabs } from 'expo-router';

export function NavigationBarComponent({
  navigateTo,
  isFocused,
}: NavigationBarComponentProps) {
  const renderTab = useCallback((
    tab: Tab<string>,
    navigation: NavigationType,
    state: StateType,
  ) => {
    const { title, icon, iconFocused } = tab;
    const focused = isFocused(tab, state);

    return (
      <Pressable
        key={ title }
        style={ styles.tabContainer }
        onPress={ () => navigateTo(tab, navigation, state) }
      >
        <View style={ styles.tab }>
          { icon && (
            <ThemedIcon
              style={ [
                styles.tabIcon,
                focused && !iconFocused && styles.tabIconFocused,
              ] }
              icon={ !focused ? icon : (iconFocused ?? icon) }
              size={ scale(24) }
              color="white"
            />
          ) }
          <ThemedText
            style={ [
              styles.tabText,
              focused && styles.tabTextFocused,
            ] }
          >
            { title }
          </ThemedText>
        </View>
      </Pressable>
    );
  }, [navigateTo, isFocused]);

  const renderTabs = useCallback((navigation: NavigationType, state: StateType) => (
    <View style={ styles.tabs }>
      { TABS_MOBILE_CONFIG.map((tab) => renderTab(tab, navigation, state)) }
    </View>
  ), [renderTab]);

  const renderTabBar = useCallback(({ navigation, state }: BottomTabBarProps) => (
    <ThemedView style={ styles.tabBar }>
      { renderTabs(navigation, state) }
    </ThemedView>
  ), [renderTabs]);

  return (
    <Tabs
      screenOptions={ {
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.white,
        tabBarHideOnKeyboard: true,
        freezeOnBlur: true,
        sceneStyle: {
          marginHorizontal: 16,
        },
      } }
      tabBar={ renderTabBar }
    />
  );
}

export default NavigationBarComponent;
