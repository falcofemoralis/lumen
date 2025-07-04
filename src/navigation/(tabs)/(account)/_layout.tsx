import { Stack } from 'expo-router';
import t from 'i18n/t';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';

export default function Layout() {
  return (
    <Stack
      screenOptions={ {
        headerShown: false,
        animation: DEFAULT_ROUTE_ANIMATION,
      } }
    >
      <Stack.Screen
        name="index"
        options={ {
          headerShown: false,
        } }
      />
      <Stack.Screen
        name="settings"
        options={ {
          presentation: 'modal',
          headerShown: false,
          headerTitle: t('Settings'),
          animation: 'ios_from_right',
        } }
      />
    </Stack>
  );
}
