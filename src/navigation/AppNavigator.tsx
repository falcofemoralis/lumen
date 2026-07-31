/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ErrorBoundary } from 'Component/ErrorBoundary';
import { useConfigContext, useIsTV } from 'Context/ConfigContext';
import { StatusBar } from 'expo-status-bar';
import { ErrorScreen } from 'Screen/ErrorScreen';
import { FilmTrailerScreen } from 'Screen/FilmTrailerScreen';
import { PlayerScreen } from 'Screen/PlayerScreen';
import { WelcomeScreen } from 'Screen/WelcomeScreen';
import { useAppTheme } from 'Theme/context';
import { navigationRef, useBackButtonHandler } from 'Util/Navigation';

import {
  ERROR_SCREEN,
  exitRoutes,
  exitRoutesTV,
  FILM_TRAILER_SCREEN,
  PLAYER_SCREEN,
  WELCOME_SCREEN,
} from './navigationRoutes';
import type { AppStackParamList, NavigationProps } from './navigationTypes';
import { TabsNavigator } from './TabsNavigator';
const Stack = createNativeStackNavigator<AppStackParamList>();

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
      initialRouteName="Tabs"
    >
      <Stack.Screen
        name="Tabs"
        component={ TabsNavigator }
      />
      <Stack.Screen
        name={ ERROR_SCREEN }
        component={ ErrorScreen }
      />
      <Stack.Screen
        name={ PLAYER_SCREEN }
        component={ PlayerScreen }
      />
      <Stack.Screen
        name={ FILM_TRAILER_SCREEN }
        component={ FilmTrailerScreen }
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme, themeContext } = useAppTheme();
  const isTV = useIsTV();

  useBackButtonHandler((routeName) => (isTV ? exitRoutesTV : exitRoutes).includes(routeName));

  return (
    <>
      <NavigationContainer ref={ navigationRef } theme={ navigationTheme } { ...props }>
        <ErrorBoundary catchErrors="always">
          <AppStack />
        </ErrorBoundary>
      </NavigationContainer>
      <StatusBar style={ themeContext === 'dark' ? 'light' : 'dark' } />
    </>
  );
};
