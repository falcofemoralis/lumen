import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DownloadsScreen } from 'Screen/DownloadsScreen';
import { MyCommentsScreen } from 'Screen/MyCommentsScreen';
import { NotificationsScreen } from 'Screen/NotificationsScreen';
import { SettingsScreen } from 'Screen/SettingsScreen';
import { useAppTheme } from 'Theme/context';

import { createFilmNavigator } from './FilmNavigator';
import {
  DOWNLOADS_SCREEN,
  MY_COMMENTS_SCREEN,
  MY_COMMENTS_TAB,
  NOTIFICATIONS_SCREEN,
  NOTIFICATIONS_TAB,
  SETTINGS_SCREEN,
} from './navigationRoutes';

const Stack = createNativeStackNavigator();

// NOTE: created once, calling it inline in JSX would remount the screen on every render
const NotificationsNavigator = createFilmNavigator(NOTIFICATIONS_TAB, NotificationsScreen);
// Wrapped in a film navigator of its own: a comment row opens the film it was
// written on, which is a screen this stack does not carry.
const MyCommentsNavigator = createFilmNavigator(MY_COMMENTS_TAB, MyCommentsScreen);

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
          component={ NotificationsNavigator }
        />
        <Stack.Screen
          name={ SETTINGS_SCREEN }
          component={ SettingsScreen }
        />
        <Stack.Screen
          name={ DOWNLOADS_SCREEN }
          component={ DownloadsScreen }
        />
        <Stack.Screen
          name={ MY_COMMENTS_SCREEN }
          component={ MyCommentsNavigator }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createAccountNavigator = (name: string, component: any) => {
  return () => <AccountNavigator name={ name } component={ component } />;
};