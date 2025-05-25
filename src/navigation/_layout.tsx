import { DarkTheme,ThemeProvider } from '@react-navigation/native';
import { Portal } from 'Component/ThemedPortal';
import { AppProvider } from 'Context/AppContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useLocale } from 'Hooks/useLocale';
import t from 'i18n/t';
import React, { useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';
import { setTimeoutSafe } from 'Util/Misc';

SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  const [languageLoaded] = useLocale();

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
        animation: DEFAULT_ROUTE_ANIMATION,
      } }
    >
      <Stack.Screen
        name="modal"
        options={ {
          presentation: 'modal',
          headerShown: true,
        } }
      />
    </Stack>
  );

  const renderTVLayout = () => (
    <SpatialNavigationDeviceTypeProvider>
      { renderStack() }
    </SpatialNavigationDeviceTypeProvider>
  );

  const renderMobileLayout = () => (
    <GestureHandlerRootView>
      { renderStack() }
    </GestureHandlerRootView>
  );

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
        <AppProvider>
          <Portal.Host>
            { ConfigStore.isTV() ? renderTVLayout() : renderMobileLayout() }
          </Portal.Host>
        </AppProvider>
      </ThemeProvider>
    )
  }

  return (
    <SafeAreaView style={ { flex: 1, backgroundColor: Colors.background } }>
      { renderApp() }
    </SafeAreaView>
  );
}

export default RootLayout;
