import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Colors } from 'Style/Colors';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'Hooks/useColorScheme';
import React from 'react';
import { Pressable } from 'react-native';

export function NavigationBarComponent() {
  const colorScheme = useColorScheme();

  const tabBarButton = (props: BottomTabBarButtonProps) => {
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

  const renderMobileBar = () => {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarButton,
            // tabBarIcon: ({ color, focused }) => (
            //   <TabBarIcon
            //     name={focused ? 'home' : 'home-outline'}
            //     color={color}
            //   />
            // ),
          }}
        />
        <Tabs.Screen
          name="film"
          options={{
            title: 'Home',
            tabBarButton,
            // tabBarIcon: ({ color, focused }) => (
            //   <TabBarIcon
            //     name={focused ? 'home' : 'home-outline'}
            //     color={color}
            //   />
            // ),
          }}
        />
        {/* <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarButton,
          tabBarLabelStyle: textStyles.default
        }}
      />
      <Tabs.Screen
        name="tv_focus"
        options={{
          title: 'TV event demo',
          tabBarButton,
          tabBarLabelStyle: textStyles.default
        }}
      /> */}
      </Tabs>
    );
  };

  return renderMobileBar();
}

export default NavigationBarComponent;
