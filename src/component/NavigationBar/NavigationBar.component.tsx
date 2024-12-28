import {
  BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import { Tabs } from 'Component/Layouts/tabs';
import ThemedIcon from 'Component/ThemedIcon';
import React from 'react';
import { Pressable } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { Tab, TABS_MOBILE_CONFIG } from './NavigationBar.config';
import { styles } from './NavigationBar.style';

export function NavigationBarComponent() {
  const renderBarButton = (props: BottomTabBarButtonProps) => (
    <Pressable
      { ...props }
      style={ ({ pressed, focused }) => [
        {
          opacity: pressed || focused ? 0.6 : 1.0,
        },
      ] }
    />
  );

  const renderTab = (tab: Tab<string>, idx: number) => {
    const {
      route: name, title, icon, options,
    } = tab;

    return (
      <Tabs.Screen
        key={ name }
        name={ name }
        options={ {
          title,
          tabBarIcon: ({ color, focused }) => icon && (
            <ThemedIcon
              icon={ icon }
              size={ scale(24) }
              color={ color }
            />
          ),
          ...options,
        } }
      />
    );
  };

  const renderTabs = () => TABS_MOBILE_CONFIG.map((tab, idx) => renderTab(tab, idx));

  return (
    <Tabs
      screenOptions={ {
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.white,
        tabBarHideOnKeyboard: true,
      } }
      tabBar={ () => null }
    >
      { renderTabs() }
    </Tabs>
  );
}

export default NavigationBarComponent;
