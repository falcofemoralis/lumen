import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { Tab, TABS } from './NavigationBar.config';

export function NavigationBarComponent() {
  const renderBarButton = (props: BottomTabBarButtonProps) => {
    const style: any = props.style ?? {};

    return (
      <Pressable
        {...props}
        style={({ pressed, focused }) => [
          style,
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
            <MaterialCommunityIcons
              // @ts-ignore
              name={icon}
              size={scale(24)}
              color="black"
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
        tabBarActiveTintColor: Colors.primary,
      }}
    >
      {renderTabs()}
    </Tabs>
  );
}

export default NavigationBarComponent;
