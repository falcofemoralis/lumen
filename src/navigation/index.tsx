import { NavigationProp, NavigationState, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { withSuspend } from 'Hooks/withSuspend';
import {
  COMMENTS_MODAL_ROUTE,
  ERROR_ROUTE,
  LOGIN_MODAL_ROUTE,
  PLAYER_ROUTE,
  SCHEDULE_MODAL_ROUTE,
  WELCOME_ROUTE,
} from 'Navigation/routes';
import { lazy } from 'react';
import ConfigStore from 'Store/Config.store';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';

import TabsStack from './tabs';

const WelcomePage = withSuspend(lazy(() => import('Route/WelcomePage')));
const ErrorPage = withSuspend(lazy(() => import('Route/ErrorPage')));
const PlayerPage = withSuspend(lazy(() => import('Route/PlayerPage')));

const LoginModal = withSuspend(lazy(() => import('Route/modal/LoginModal')));
const CommentsModal = withSuspend(lazy(() => import('Route/modal/CommentsModal')));
const ScheduleModal = withSuspend(lazy(() => import('Route/modal/ScheduleModal')));

const Stack = createNativeStackNavigator();

export function RootStack() {
  if (!ConfigStore.isConfigured()) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name={ WELCOME_ROUTE }
          component={ withSuspend(WelcomePage) }
          options={ {
            headerShown: false,
            animation: DEFAULT_ROUTE_ANIMATION,
            contentStyle: { backgroundColor: Colors.background },
          } }
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName="Tabs">
      <Stack.Group
        screenOptions={ {
          headerShown: false,
          animation: DEFAULT_ROUTE_ANIMATION,
          contentStyle: { backgroundColor: Colors.background },
        } }
      >
        <Stack.Screen
          name="Tabs"
          component={ TabsStack }
        />
        <Stack.Screen
          name={ ERROR_ROUTE }
          component={ withSuspend(ErrorPage) }
        />
        <Stack.Screen
          name={ PLAYER_ROUTE }
          component={ withSuspend(PlayerPage) }
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={ {
          presentation: 'modal',
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'ios_from_right',
        } }
      >
        <Stack.Screen
          name={ LOGIN_MODAL_ROUTE }
          component={ withSuspend(LoginModal) }
        />
        <Stack.Screen
          name={ COMMENTS_MODAL_ROUTE }
          component={ withSuspend(CommentsModal) }
        />
        <Stack.Screen
          name={ SCHEDULE_MODAL_ROUTE }
          component={ withSuspend(ScheduleModal) }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

type RootStackParamList = StaticParamList<typeof Stack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type Navigation = Omit<NavigationProp<ReactNavigation.RootParamList>, 'getState'> & {
  getState(): NavigationState | undefined;
}