import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Portal } from 'Component/ThemedPortal';
import { AppProvider } from 'Context/AppContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useLocale } from 'Hooks/useLocale';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';

SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const [languageLoaded] = useLocale();

  useEffect(() => {
    if (languageLoaded) {
      SplashScreen.hideAsync();
    }
  }, [languageLoaded]);

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
          animation: 'ios_from_right',
          headerShown: false,
        } }
      />
    </Stack>
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
          <SpatialNavigationDeviceTypeProvider>
            <GestureHandlerRootView>
              <Portal.Host>
                { renderStack() }
              </Portal.Host>
            </GestureHandlerRootView>
          </SpatialNavigationDeviceTypeProvider>
        </AppProvider>
      </ThemeProvider>
    );
  };

  return renderApp();
}

export default RootLayout;
