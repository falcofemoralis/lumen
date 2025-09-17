import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoggerPage from 'Route/LoggerPage';
import { LOGGER_ROUTE } from 'Route/LoggerPage/LoggerPage.config';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';
import { Colors } from 'Style/Colors';

const Stack = createNativeStackNavigator();

const SettingsStack = ({ name, component }: { name: string, component: any }) => {
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
          name={ LOGGER_ROUTE }
          component={ LoggerPage }
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const createSettingsStack = (name: string, component: any) => {
  return () => <SettingsStack name={ name } component={ component } />;
};