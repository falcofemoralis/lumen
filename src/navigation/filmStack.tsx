import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ActorPage from 'Route/ActorPage';
import CategoryPage from 'Route/CategoryPage';
import FilmPage from 'Route/FilmPage';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';

import { ACTOR_ROUTE, CATEGORY_ROUTE, FILM_ROUTE } from './routes';

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
          component={ FilmPage } // we always should preload film page because it will be 100% opened
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createFilmStack = (name: string, component: any) => {
  return () => <FilmStack name={ name } component={ component } />;
};