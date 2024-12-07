import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import ThemedIcon from 'Component/ThemedIcon';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { Tab, TABS } from './NavigationBar.config';
import { styles } from './NavigationBar.style';

export function NavigationBarComponent() {
  const renderBarButton = (props: BottomTabBarButtonProps) => {
    return (
      <Pressable
        {...props}
        style={({ pressed, focused }) => [
          {
            opacity: pressed || focused ? 0.6 : 1.0,
          },
        ]}
      />
    );
  };

  const renderTab = (tab: Tab, idx: number) => {
    const { route, name, icon } = tab;

    const formattedRoute = route.toString().replace('./', '');

    return (
      <Tabs.Screen
        key={idx}
        name={formattedRoute === '' ? 'index' : formattedRoute}
        options={{
          title: name,
          tabBarIcon: ({ color, focused }) => (
            <ThemedIcon
              icon={icon}
              size={scale(24)}
              color={color}
            />
          ),
        }}
      />
    );
  };

  const renderTabs = () => {
    return TABS.map((tab, idx) => renderTab(tab, idx));
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.white,
        tabBarHideOnKeyboard: true,
      }}
    >
      {renderTabs()}
    </Tabs>
  );
}

export default NavigationBarComponent;
