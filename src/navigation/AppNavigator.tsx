/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DeepLinkHandler } from 'Component/DeepLinkHandler';
import { ErrorBoundary } from 'Component/ErrorBoundary';
import { TvSearchHandler } from 'Component/TvSearchHandler';
import { useConfigContext, useIsTV } from 'Context/ConfigContext';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ErrorScreen } from 'Screen/ErrorScreen';
import { FilmTrailerScreen } from 'Screen/FilmTrailerScreen';
import { PlayerScreen } from 'Screen/PlayerScreen';
import BroadcastPlayer from 'Screen/BroadcastScreen/BroadcastPlayer';
import { DownloadsScreen } from 'Screen/DownloadsScreen';
import { MyCommentsScreen } from 'Screen/MyCommentsScreen';
import { NotificationsScreen } from 'Screen/NotificationsScreen';
import { SettingsScreen } from 'Screen/SettingsScreen';
import { WelcomeScreen } from 'Screen/WelcomeScreen';
import { useAppTheme } from 'Theme/context';
import { navigationRef, useBackButtonHandler } from 'Util/Navigation';

import {
  DOWNLOADS_SCREEN,
  ERROR_SCREEN,
  exitRoutesMobile,
  exitRoutesTV,
  FILM_TRAILER_SCREEN,
  MY_COMMENTS_SCREEN,
  MY_COMMENTS_TAB,
  NOTIFICATIONS_SCREEN,
  NOTIFICATIONS_TAB,
  PLAYER_SCREEN,
  SETTINGS_SCREEN,
  TABS_SCREEN,
  WELCOME_SCREEN,
} from './navigationRoutes';
import type { AppStackParamList, NavigationProps } from './navigationTypes';
import { TabsNavigator } from './TabsNavigator';
import { createFilmNavigator } from './FilmNavigator';

const Stack = createNativeStackNavigator<AppStackParamList>();

const NotificationsNavigator = createFilmNavigator(NOTIFICATIONS_TAB, NotificationsScreen);
const MyCommentsNavigator = createFilmNavigator(MY_COMMENTS_TAB, MyCommentsScreen);

const AppStack = () => {
  const { isConfigured } = useConfigContext();
  const { theme } = useAppTheme();

  if (!isConfigured) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name={ WELCOME_SCREEN }
          component={ WelcomeScreen }
          options={ {
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: theme.colors.background },
          } }
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={ {
        headerShown: false,
        navigationBarColor: theme.colors.background,
        contentStyle: { backgroundColor: theme.colors.background },
      } }
      initialRouteName={ TABS_SCREEN }
    >
      <Stack.Screen
        name={ TABS_SCREEN }
        component={ TabsNavigator }
      />
      <Stack.Screen
        name={ ERROR_SCREEN }
        component={ ErrorScreen }
      />
      <Stack.Screen name="BroadcastPlayer" component={ BroadcastPlayer } />
      <Stack.Screen
        name={ PLAYER_SCREEN }
        component={ PlayerScreen }
      />
      <Stack.Screen
        name={ FILM_TRAILER_SCREEN }
        component={ FilmTrailerScreen }
      />
      <Stack.Screen
        name={ SETTINGS_SCREEN }
        component={ SettingsScreen }
      />
      <Stack.Screen
        name={ NOTIFICATIONS_SCREEN }
        component={ NotificationsNavigator }
      />
      <Stack.Screen
        name={ DOWNLOADS_SCREEN }
        component={ DownloadsScreen }
      />
      <Stack.Screen
        name={ MY_COMMENTS_SCREEN }
        component={ MyCommentsNavigator }
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme, themeContext } = useAppTheme();
  const { isLocalLibrary } = useConfigContext();
  const isTV = useIsTV();

  const exitRoutes = useMemo(() => {
    const routes = isTV ? exitRoutesTV : exitRoutesMobile;

    if (isLocalLibrary && isTV) {
      routes.push(DOWNLOADS_SCREEN);
    }

    return routes;
  }, [isLocalLibrary, isTV]);

  useBackButtonHandler((routeName) => exitRoutes.includes(routeName));

  return (
    <>
      <NavigationContainer ref={ navigationRef } theme={ navigationTheme } { ...props }>
        <ErrorBoundary catchErrors="always">
          <DeepLinkHandler />
          <TvSearchHandler />
          <AppStack />
        </ErrorBoundary>
      </NavigationContainer>
      <StatusBar style={ themeContext === 'dark' ? 'light' : 'dark' } />
    </>
  );
};
