import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NOTIFICATIONS_ROUTE, SETTINGS_ROUTE } from 'Navigation/routes';
import NotificationsPage from 'Route/NotificationsPage';
import SettingsPage from 'Route/SettingsPage';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';

import { createFilmStack } from './filmStack';
import { createSettingsStack } from './settingsStack';

const Stack = createNativeStackNavigator();

const AccountStack = ({ name, component }: { name: string, component: any }) => {
  const pageName = `${name}-page`;

  return (
    <Stack.Navigator initialRouteName={ pageName }>
      <Stack.Group
        screenOptions={ {
          headerShown: false,
          animation: DEFAULT_ROUTE_ANIMATION,
          contentStyle: { backgroundColor: Colors.background },
        } }
      >
        <Stack.Screen
          name={ pageName }
          component={ component }
        />
        <Stack.Screen
          name={ NOTIFICATIONS_ROUTE }
          component={ createFilmStack(NOTIFICATIONS_ROUTE, NotificationsPage) }
        />
        <Stack.Screen
          name={ SETTINGS_ROUTE }
          component={ createSettingsStack(SETTINGS_ROUTE, SettingsPage) }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createAccountStack = (name: string, component: any) => {
  return () => <AccountStack name={ name } component={ component } />;
};