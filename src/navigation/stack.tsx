import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ActorPage from 'Route/ActorPage';
import { ACTOR_ROUTE } from 'Route/ActorPage/ActorPage.config';
import CategoryPage from 'Route/CategoryPage';
import { CATEGORY_ROUTE } from 'Route/CategoryPage/CategoryPage.config';
import FilmPage from 'Route/FilmPage';
import { FILM_ROUTE } from 'Route/FilmPage/FilmPage.config';
import NotificationsPage from 'Route/NotificationsPage';
import { NOTIFICATIONS_ROUTE } from 'Route/NotificationsPage/NotificationsPage.config';
import SettingsPage from 'Route/SettingsPage';
import { SETTINGS_ROUTE } from 'Route/SettingsPage/SettingsPage.config';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';

const Stack = createNativeStackNavigator();

const FilmStack = ({ name, component }: { name: string, component: any }) => {
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
          name={ ACTOR_ROUTE }
          component={ ActorPage }
        />
        <Stack.Screen
          name={ CATEGORY_ROUTE }
          component={ CategoryPage }
        />
        <Stack.Screen
          name={ FILM_ROUTE }
          component={ FilmPage }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createFilmStack = (name: string, component: any) => {
  return () => <FilmStack name={ name } component={ component } />;
};

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
          component={ SettingsPage }
          options={ {
            animation: 'ios_from_right',
          } }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createAccountStack = (name: string, component: any) => {
  return () => <AccountStack name={ name } component={ component } />;
};