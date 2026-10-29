import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActorScreen } from 'Screen/ActorScreen';
import { CategoryScreen } from 'Screen/CategoryScreen';
import { CollectionScreen } from 'Screen/CollectionScreen';
import { FilmScreen } from 'Screen/FilmScreen';
import { useAppTheme } from 'Theme/context';

import { ACTOR_SCREEN, CATEGORY_SCREEN, COLLECTION_SCREEN, FILM_SCREEN } from './navigationRoutes';

export interface FilmNavigatorScreen {
  name: string;
  component: any;
}

const Stack = createNativeStackNavigator();

export const FilmNavigator = ({
  name,
  component,
  additionalScreens = [],
}: {
  name: string;
  component: any;
  additionalScreens?: FilmNavigatorScreen[];
}) => {
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
        { additionalScreens.map(({ name: screenName, component: ScreenComponent }) => (
          <Stack.Screen
            key={ screenName }
            name={ screenName }
            component={ ScreenComponent }
          />
        )) }
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createFilmNavigator = (
  name: string,
  component: any,
  additionalScreens: FilmNavigatorScreen[] = [],
) => {
  return () => (
    <FilmNavigator
      name={ name }
      component={ component }
      additionalScreens={ additionalScreens }
    />
  );
};