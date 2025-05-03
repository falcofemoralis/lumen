import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import ThemedIcon from 'Component/ThemedIcon';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { Tabs } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import {
  Image,
  Pressable,
  View,
} from 'react-native';
import NavigationStore from 'Store/Navigation.store';
import { Colors } from 'Style/Colors';
import { CONTENT_WRAPPER_PADDING } from 'Style/Layout';
import { scale } from 'Util/CreateStyles';

import { TABS_MOBILE_CONFIG } from './NavigationBar.config';
import { styles } from './NavigationBar.style';
import {
  NavigationBarComponentProps, NavigationType, StateType, Tab,
  TAB_COMPONENT,
} from './NavigationBar.type';

export { Tabs } from 'expo-router';

export function NavigationBarComponent({
  profile,
  navigateTo,
  isFocused,
}: NavigationBarComponentProps) {
  const renderDefaultTab = useCallback((tab: Tab, focused: boolean) => {
    const { title, icon, iconFocused } = tab;

    return (
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
    );
  }, []);

  const renderAccountTab = useCallback((tab: Tab, focused: boolean) => {
    const { title } = tab;
    const { avatar } = profile ?? {};

    const badge = NavigationStore.badgeData[tab.route] ?? 0;

    return (
      <View style={ styles.tab }>
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
        <ThemedText
          style={ [
            styles.tabText,
            focused && styles.tabTextFocused,
          ] }
        >
          { title }
        </ThemedText>
      </View>
    );
  }, [profile, NavigationStore.badgeData]);

  const renderTab = useCallback((
    tab: Tab,
    navigation: NavigationType,
    state: StateType,
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
      <Pressable
        key={ title }
        style={ styles.tabContainer }
        onPress={ () => navigateTo(tab, navigation, state) }
      >
        { renderComponent() }
      </Pressable>
    );
  }, [navigateTo, isFocused, renderAccountTab, renderDefaultTab]);

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
          marginHorizontal: CONTENT_WRAPPER_PADDING,
        },
        lazy: false,
      } }
      tabBar={ renderTabBar }
    />
  );
}

export default observer(NavigationBarComponent);
