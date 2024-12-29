import { Tabs } from 'Component/Layouts/tabs';
import ThemedIcon from 'Component/ThemedIcon';
import React from 'react';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { Tab, TABS_MOBILE_CONFIG } from './NavigationBar.config';
import { styles } from './NavigationBar.style';

export function NavigationBarComponent() {
  // const handlePress = (e: GestureResponderEvent, props: BottomTabBarButtonProps) => {
  //   goBack();
  //   if (props.onPress) {
  //     // props.onPress(e);
  //   }
  // };

  // const tabBarButton = (props: BottomTabBarButtonProps) => {
  //   const style: StyleProp<ViewStyle> = props.style ?? {};

  //   return (
  //     <Pressable
  //       { ...props }
  //       onPress={ (e) => handlePress(e, props) }
  //       style={ ({ pressed, focused }) => [
  //         style,
  //         {
  //           opacity: pressed || focused ? 0.6 : 1.0,
  //         },
  //       ] }
  //     />
  //   );
  // };

  const renderTab = (tab: Tab<string>) => {
    const {
      route: name,
      title,
      icon,
      options,
    } = tab;

    return (
      <Tabs.Screen
        key={ name }
        name={ name }
        options={ {
          title,
          // tabBarButton,
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

  const renderTabs = () => TABS_MOBILE_CONFIG.map((tab) => renderTab(tab));

  return (
    <Tabs
      screenOptions={ {
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarActiveTintColor: Colors.blue,
        tabBarInactiveTintColor: Colors.white,
        tabBarHideOnKeyboard: true,
        // tabBarButton,
      } }
      // tabBar={ () => null }
    >
      { renderTabs() }
    </Tabs>
  );
}

export default NavigationBarComponent;
