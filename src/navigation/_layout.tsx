import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'Component/Layouts/stack';
import Constants from 'expo-constants';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from 'Hooks/useLocale';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { BackHandler, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import Colors from 'Style/Colors';
import { configureRemoteControl } from 'Util/RemoteControl';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const colorScheme = useColorScheme();
  const [languageLoaded] = useLocale();

  useEffect(() => {
    if (ConfigStore.isTV) {
      configureRemoteControl();
    }
  }, []);

  useEffect(() => {
    if (languageLoaded) {
      SplashScreen.hideAsync();
      NavigationBar.setBackgroundColorAsync(Colors.background);
    }
  }, [languageLoaded]);

  useEffect(() => {
    const backAction = () => {
      if (ConfigStore.isTV) {
        if (backPressedOnce) {
          BackHandler.exitApp();

          return true;
        }

        setBackPressedOnce(true);
        NotificationStore.displayMessage('Press back again to exit');

        setTimeout(() => {
          setBackPressedOnce(false);
        }, 2000);

        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  });

  if (!languageLoaded) {
    return null;
  }

  const renderStack = () => (
    <Stack
      screenOptions={ {
        headerShown: false,
        contentStyle: {
          marginTop: Constants.statusBarHeight,
        },
        animation: 'fade',
      } }
      initialRouteName="(tabs)"
    >
      <Stack.Screen
        name="player/[data]" // player/[data]
        options={ {
          contentStyle: {
            marginTop: 0,
          },
        } }
      />
    </Stack>
  );

  const renderTVLayout = () => (
    <SpatialNavigationDeviceTypeProvider>{ renderStack() }</SpatialNavigationDeviceTypeProvider>
  );

  const renderMobileLayout = () => (
    <GestureHandlerRootView>{ renderStack() }</GestureHandlerRootView>
  );

  const renderLayout = () => (ConfigStore.isTV ? renderTVLayout() : renderMobileLayout());

  return (
    <ThemeProvider value={ colorScheme === 'dark' ? DarkTheme : DefaultTheme }>
      <PaperProvider>
        <StatusBar
          style="light"
          backgroundColor={ Colors.background }
        />
        { renderLayout() }
      </PaperProvider>
    </ThemeProvider>
  );
}

export default observer(RootLayout);
