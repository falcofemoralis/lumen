import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import { useServiceContext } from 'Context/ServiceContext';
import { Tabs } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Image,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { TABS_MOBILE_CONFIG } from './NavigationBar.config';
import { styles, TAB_ADDITIONAL_SIZE } from './NavigationBar.style';
import {
  NavigationBarComponentProps,
  NavigationType,
  StateType,
  Tab,
  TAB_COMPONENT,
} from './NavigationBar.type';

export { Tabs } from 'expo-router';

export function NavigationBarComponent({
  profile,
  navigateTo,
  isFocused,
}: NavigationBarComponentProps) {
  const { badgeData } = useServiceContext();
  const { width } = useWindowDimensions();

  const renderDefaultTab = useCallback((tab: Tab, focused: boolean) => {
    const { IconComponent } = tab;

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
  }, []);

  const renderAccountTab = useCallback((tab: Tab, focused: boolean) => {
    const { avatar } = profile ?? {};

    const badge = badgeData[tab.route] ?? 0;

    return (
      <Animated.View style={ [styles.tab, styles.tabAccount] }>
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
          { badge > 0 && (
            <View style={ styles.badge } />
          ) }
        </View>
      </Animated.View>
    );
  }, [profile, badgeData]);

  const renderTab = useCallback((
    tab: Tab,
    navigation: NavigationType,
    state: StateType,
    idx: number
  ) => {
    const { title, tabComponent } = tab;
    const focused = isFocused(tab, state);

    const renderComponent = () => {
      switch (tabComponent) {
        case TAB_COMPONENT.ACCOUNT:
          return renderAccountTab(tab, focused);
        default:
          return renderDefaultTab(tab, focused);
      }
    };

    return (
      <ThemedPressable
        key={ title }
        style={ [styles.tabContainer, {
          width: (width / TABS_MOBILE_CONFIG.length) + scale(TAB_ADDITIONAL_SIZE),
          left: idx * (width / TABS_MOBILE_CONFIG.length) - scale(TAB_ADDITIONAL_SIZE / 2),
        }] }
        onPress={ () => navigateTo(tab, navigation, state) }
      >
        { renderComponent() }
      </ThemedPressable>
    );
  }, [navigateTo, isFocused, renderAccountTab, renderDefaultTab, width]);

  const renderTabs = useCallback((navigation: NavigationType, state: StateType) => (
    <View style={ styles.tabs }>
      { TABS_MOBILE_CONFIG.map((tab, i) => renderTab(tab, navigation, state, i)) }
    </View>
  ), [renderTab]);

  const renderTabBar = useCallback(({ navigation, state }: BottomTabBarProps) => (
    <View style={ styles.tabBar }>
      { renderTabs(navigation, state) }
    </View>
  ), [renderTabs]);

  return (
    <SafeAreaView style={ { flex: 1, backgroundColor: Colors.background } }>
      <Tabs
        screenOptions={ {
          tabBarStyle: styles.tabBar,
          headerShown: false,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.white,
          tabBarHideOnKeyboard: true,
          freezeOnBlur: true,
          sceneStyle: {
            // marginHorizontal: CONTENT_WRAPPER_PADDING,
          },
          // lazy: false,
        } }
        tabBar={ renderTabBar }
      />
    </SafeAreaView>
  );
}

export default NavigationBarComponent;
