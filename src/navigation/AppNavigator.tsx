/**
 * The app navigator (formerly "AppNavigator" and "MainNavigator") is used for the primary
 * navigation flows of your app.
 * Generally speaking, it will contain an auth flow (registration, login, forgot password)
 * and a "main" flow which the user will use once logged in.
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ErrorBoundary } from 'Component/ErrorBoundary';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { StatusBar } from 'expo-status-bar';
import { ErrorScreen } from 'Screen/ErrorScreen';
import { FilmTrailerScreen } from 'Screen/FilmTrailerScreen';
import { CommentsModal } from 'Screen/modal/CommentsModal/CommentsModal.component';
import { LoginModal } from 'Screen/modal/LoginModal';
import { ScheduleModal } from 'Screen/modal/ScheduleModal';
import { SettingsModal } from 'Screen/modal/SettingsModal';
import { PlayerScreen } from 'Screen/PlayerScreen';
import { WelcomeScreen } from 'Screen/WelcomeScreen';
import { useAppTheme } from 'Theme/context';
import { navigationRef, useBackButtonHandler } from 'Util/Navigation';

import {
  COMMENTS_MODAL_SCREEN,
  ERROR_SCREEN,
  exitRoutes,
  exitRoutesTV,
  FILM_TRAILER_SCREEN,
  LOGIN_MODAL_SCREEN,
  PLAYER_SCREEN,
  SCHEDULE_MODAL_SCREEN,
  SETTINGS_MODAL_SCREEN,
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
      <Stack.Group
        screenOptions={ {
          presentation: 'modal',
          headerShown: false,
          animation: 'ios_from_right',
          contentStyle: { backgroundColor: theme.colors.background },
        } }
      >
        <Stack.Screen
          name={ LOGIN_MODAL_SCREEN }
          component={ LoginModal }
        />
        <Stack.Screen
          name={ COMMENTS_MODAL_SCREEN }
          component={ CommentsModal }
        />
        <Stack.Screen
          name={ SCHEDULE_MODAL_SCREEN }
          component={ ScheduleModal }
        />
        <Stack.Screen
          name={ SETTINGS_MODAL_SCREEN }
          component={ SettingsModal }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme, themeContext } = useAppTheme();
  const { isTV } = useConfigContext();

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
