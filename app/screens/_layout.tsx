import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import NavigationBar from 'Component/NavigationBar';
import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';
import ThemedView from 'Component/ThemedView';
import Constants from 'expo-constants';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Dimensions, useColorScheme, View } from 'react-native';
import AppStore from 'Store/App.store';
import NavigationStore from 'Store/Navigation.store';
import Colors from 'Style/Colors';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export interface Screen {
  name?: string;
  options?: any;
}

export const SCREENS: Screen[] = [
  {
    name: '(tabs)',
  },
  {
    name: 'film/[link]',
  },
  {
    name: 'settings',
  },
  {
    name: '+not-found',
  },
];

export function RootLayout() {
  const windowWidth = Dimensions.get('window').width;
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      if (error) {
        console.warn(`Error in loading fonts: ${error}`);
      }
    }
  }, [loaded, error]);

  if (!loaded && !error) {
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
      <Stack screenOptions={{ contentStyle: { marginTop: Constants.statusBarHeight } }}>
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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar
        style="light"
        backgroundColor={Colors.background}
      />
      {AppStore.isTV ? renderTVLayout() : renderMobileLayout()}
    </ThemeProvider>
  );
}

export default observer(RootLayout);
