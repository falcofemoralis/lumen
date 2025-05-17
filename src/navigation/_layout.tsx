import {
  DarkTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { MenuProvider } from 'Component/NavigationBar/MenuContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useLocale } from 'Hooks/useLocale';
import t from 'i18n/t';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import Colors from 'Style/Colors';
import { setTimeoutSafe } from 'Util/Misc';

SplashScreen.preventAutoHideAsync();

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
        NotificationStore.displayMessage(t('Press back again to exit'));

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

  const renderStack = () => (
    <Stack
      screenOptions={ {
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
        animation: 'fade',
      } }
    />
  );

  const renderTVLayout = () => (
    <MenuProvider>
      <SpatialNavigationDeviceTypeProvider>
        { renderStack() }
      </SpatialNavigationDeviceTypeProvider>
    </MenuProvider>
  );

  const renderMobileLayout = () => (
    <GestureHandlerRootView>
      { renderStack() }
    </GestureHandlerRootView>
  );

  const renderLayout = () => (ConfigStore.isTV() ? renderTVLayout() : renderMobileLayout());

  const renderApp = () => {
    if (!languageLoaded) {
      return null;
    }

    return (
      <ThemeProvider
        value={ {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: Colors.background,
          },
        } }
      >
        <PaperProvider>
          { renderLayout() }
        </PaperProvider>
      </ThemeProvider>
    )
  }

  return (
    <SafeAreaView style={ { flex: 1, backgroundColor: Colors.background } }>
      { renderApp() }
    </SafeAreaView>
  );
}

export default observer(RootLayout);
