import { NavigationProp, NavigationState, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  COMMENTS_MODAL_ROUTE,
  ERROR_ROUTE,
  LOGIN_MODAL_ROUTE,
  PLAYER_ROUTE,
  SCHEDULE_MODAL_ROUTE,
  WELCOME_ROUTE,
} from 'Navigation/routes';
import ErrorPage from 'Route/ErrorPage';
import CommentsModal from 'Route/modal/CommentsModal';
import LoginModal from 'Route/modal/LoginModal';
import ScheduleModal from 'Route/modal/ScheduleModal';
import PlayerPage from 'Route/PlayerPage';
import WelcomePage from 'Route/WelcomePage';
import ConfigStore from 'Store/Config.store';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';

import TabsStack from './tabs';

const Stack = createNativeStackNavigator();

export function RootStack() {
  if (!ConfigStore.isConfigured()) {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name={ WELCOME_ROUTE }
          component={ WelcomePage }
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
          component={ ErrorPage }
        />
        <Stack.Screen
          name={ PLAYER_ROUTE }
          component={ PlayerPage }
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
          component={ LoginModal }
        />
        <Stack.Screen
          name={ COMMENTS_MODAL_ROUTE }
          component={ CommentsModal }
        />
        <Stack.Screen
          name={ SCHEDULE_MODAL_ROUTE }
          component={ ScheduleModal }
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