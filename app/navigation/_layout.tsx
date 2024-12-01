import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import NavigationBar from 'Component/NavigationBar';
import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import ThemedView from 'Component/ThemedView';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useLocale } from 'Hooks/useLocale';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Dimensions, useColorScheme, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SpatialNavigationDeviceTypeProvider } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import NavigationStore from 'Store/Navigation.store';
import Colors from 'Style/Colors';
import 'Util/RemoteControl';

export interface Screen {
  name?: string;
  options?: any;
}

export const ROOT_ROUTE = '(tabs)';
export const FILM_ROUTE = 'film/[link]';

export const SCREENS: Screen[] = [
  {
    name: ROOT_ROUTE,
  },
  {
    name: FILM_ROUTE,
  },
  {
    name: 'settings',
  },
  {
    name: '+not-found',
  },
  {
    name: 'welcome',
  },
];

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const windowWidth = Dimensions.get('window').width;
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

  const renderScreens = () => {
    return SCREENS.map((screen, index) => {
      const { name, options = {} } = screen;

      return (
        <Stack.Screen
          key={index}
          name={name}
          options={{ headerShown: false, ...options }}
        />
      );
    });
  };

  const renderStack = () => {
    return (
      <Stack
        screenOptions={{
          contentStyle: { marginTop: Constants.statusBarHeight },
          animation: 'fade',
        }}
      >
        {renderScreens()}
      </Stack>
    );
  };

  const renderTVLayout = () => {
    const width = NavigationStore.isNavigationVisible
      ? windowWidth - NAVIGATION_BAR_TV_WIDTH
      : windowWidth;

    return (
      <ThemedView style={{ flex: 1, flexDirection: 'row', width: '100%' }}>
        <NavigationBar />
        <View style={{ width }}>{renderStack()}</View>
      </ThemedView>
    );
  };

  const renderMobileLayout = () => {
    return renderStack();
  };

  const renderLayout = () => {
    return ConfigStore.isTV ? renderTVLayout() : renderMobileLayout();
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider>
        <SpatialNavigationDeviceTypeProvider>
          <StatusBar
            style="light"
            backgroundColor={Colors.background}
          />
          {renderLayout()}
        </SpatialNavigationDeviceTypeProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}

export default observer(RootLayout);
