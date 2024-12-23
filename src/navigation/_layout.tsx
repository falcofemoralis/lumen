import 'Util/RemoteControl';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'Component/Layouts/stack';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from 'Hooks/useLocale';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import Colors from 'Style/Colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const colorScheme = useColorScheme();
  const [languageLoaded] = useLocale();
  const [fontLoaded, fontError] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if ((fontLoaded || fontError) && languageLoaded) {
      SplashScreen.hideAsync();

      if (fontError) {
        console.warn(`Error in loading fonts: ${fontError}`);
      }
    }
  }, [fontLoaded, fontError, languageLoaded]);

  if ((!fontLoaded && !fontError) || !languageLoaded) {
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
    />
  );

  const renderTVLayout = () => (
    <SpatialNavigationDeviceTypeProvider>{ renderStack() }</SpatialNavigationDeviceTypeProvider>
  );

  const renderMobileLayout = () => renderStack();

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
