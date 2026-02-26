import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DownloadsScreen } from 'Screen/DownloadsScreen';
import { NotificationsScreen } from 'Screen/NotificationsScreen';
import { SettingsScreen } from 'Screen/SettingsScreen';
import { useAppTheme } from 'Theme/context';

import { createFilmNavigator } from './FilmNavigator';
import {
  DOWNLOADS_SCREEN,
  NOTIFICATIONS_SCREEN,
  NOTIFICATIONS_TAB,
  SETTINGS_SCREEN,
} from './navigationRoutes';

const Stack = createNativeStackNavigator();

const AccountNavigator = ({ name, component }: { name: string, component: any }) => {
  const { theme } = useAppTheme();

  return (
    <Stack.Navigator initialRouteName={ name }>
      <Stack.Group
        screenOptions={ {
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.colors.background },
        } }
      >
        <Stack.Screen
          name={ name }
          component={ component }
        />
        <Stack.Screen
          name={ NOTIFICATIONS_SCREEN }
          component={ createFilmNavigator(NOTIFICATIONS_TAB, NotificationsScreen) }
        />
        <Stack.Screen
          name={ SETTINGS_SCREEN }
          component={ SettingsScreen }
        />
        <Stack.Screen
          name={ DOWNLOADS_SCREEN }
          component={ DownloadsScreen }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createAccountNavigator = (name: string, component: any) => {
  return () => <AccountNavigator name={ name } component={ component } />;
};