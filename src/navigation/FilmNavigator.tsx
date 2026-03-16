import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActorScreen } from 'Screen/ActorScreen';
import { CategoryScreen } from 'Screen/CategoryScreen';
import { CollectionScreen } from 'Screen/CollectionScreen';
import { FilmScreen } from 'Screen/FilmScreen';
import { useAppTheme } from 'Theme/context';

import { ACTOR_SCREEN, CATEGORY_SCREEN, COLLECTION_SCREEN, FILM_SCREEN } from './navigationRoutes';

const Stack = createNativeStackNavigator();

export const FilmNavigator = ({ name, component }: { name: string, component: any }) => {
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
          name={ ACTOR_SCREEN }
          component={ ActorScreen }
        />
        <Stack.Screen
          name={ CATEGORY_SCREEN }
          component={ CategoryScreen }
        />
        <Stack.Screen
          name={ FILM_SCREEN }
          component={ FilmScreen }
        />
        <Stack.Screen
          name={ COLLECTION_SCREEN }
          component={ CollectionScreen }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createFilmNavigator = (name: string, component: any) => {
  return () => <FilmNavigator name={ name } component={ component } />;
};