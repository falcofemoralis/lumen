import {
  DarkTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { MenuProvider } from 'Component/NavigationBar/MenuContext';
import Constants from 'expo-constants';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from 'Hooks/useLocale';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import Colors from 'Style/Colors';
import { setTimeoutSafe } from 'Util/Misc';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  fade: true,
});

export function RootLayout() {
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const [languageLoaded] = useLocale();

  const loadNotifications = async () => {
    try {
      await ServiceStore.getNotifications();
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  };

  useEffect(() => {
    if (ServiceStore.isSignedIn) {
      loadNotifications();
    }

    NavigationBar.setBackgroundColorAsync(Colors.background);
  }, []);

  useEffect(() => {
    if (languageLoaded) {
      SplashScreen.hideAsync();
    }
  }, [languageLoaded]);

  useEffect(() => {
    const backAction = () => {
      if (ConfigStore.isTV()) {
        if (backPressedOnce) {
          BackHandler.exitApp();

          return true;
        }

        setBackPressedOnce(true);
        NotificationStore.displayMessage('Press back again to exit');

        setTimeoutSafe(() => {
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
    return (
      <StatusBar
        style="light"
        backgroundColor={ Colors.background }
      />
    );
  }

  const renderStack = () => (
    <Stack
      screenOptions={ {
        headerShown: false,
        contentStyle: {
          marginTop: Constants.statusBarHeight,
          backgroundColor: Colors.background,
        },
        animation: 'fade',
      } }
    >
      <Stack.Screen
        name="player"
        options={ {
          contentStyle: {
            marginTop: 0,
          },
        } }
      />
    </Stack>
  );

  const renderTVLayout = () => (
    <MenuProvider>
      <SpatialNavigationDeviceTypeProvider>{ renderStack() }</SpatialNavigationDeviceTypeProvider>
    </MenuProvider>
  );

  const renderMobileLayout = () => (
    <GestureHandlerRootView>{ renderStack() }</GestureHandlerRootView>
  );

  const renderLayout = () => (ConfigStore.isTV() ? renderTVLayout() : renderMobileLayout());

  return (
    <ThemeProvider value={ {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: Colors.background,
      },
    } }
    >
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
