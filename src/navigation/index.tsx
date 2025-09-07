import { NavigationProp, NavigationState, StaticParamList } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CommentsModal from 'Route/CommentsModal';
import { COMMENTS_MODAL_ROUTE } from 'Route/CommentsModal/CommentsModal.config';
import ErrorPage from 'Route/ErrorPage';
import { ERROR_ROUTE } from 'Route/ErrorPage/ErrorPage.config';
import LoaderPage from 'Route/LoaderPage';
import { LOADER_ROUTE } from 'Route/LoaderPage/LoaderPage.config';
import LoginModal from 'Route/LoginModal';
import { LOGIN_MODAL_ROUTE } from 'Route/LoginModal/LoginModal.config';
import PlayerPage from 'Route/PlayerPage';
import { PLAYER_ROUTE } from 'Route/PlayerPage/PlayerPage.config';
import ScheduleModal from 'Route/ScheduleModal';
import { SCHEDULE_MODAL_ROUTE } from 'Route/ScheduleModal/ScheduleModal.config';
import WelcomePage from 'Route/WelcomePage';
import { WELCOME_ROUTE } from 'Route/WelcomePage/WelcomePage.config';
import ConfigStore from 'Store/Config.store';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';

import { TabsStack } from './tabs';

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
        <Stack.Screen
          name={ LOADER_ROUTE }
          component={ LoaderPage }
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