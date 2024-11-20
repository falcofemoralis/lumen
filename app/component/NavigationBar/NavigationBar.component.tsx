import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import Icon from 'Component/Icon';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Colors } from 'Style/Colors';
import { Tab, TABS } from './NavigationBar.config';
import { styles } from './NavigationBar.style';
import { scale } from 'Util/CreateStyles';

export function NavigationBarComponent() {
  const renderBarButton = (props: BottomTabBarButtonProps) => {
    return (
      <Pressable
        {...props}
        style={({ pressed, focused }) => [
          styles.button,
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
          tabBarButton: renderBarButton,
          tabBarIcon: ({ color, focused }) => (
            <Icon
              style={styles.buttonIcon}
              icon={icon}
              size={scale(24)}
              color="white"
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
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
      }}
    >
      {renderTabs()}
    </Tabs>
  );
}

export default NavigationBarComponent;
