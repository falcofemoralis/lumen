import { Stack } from 'expo-router';
import { DEFAULT_ROUTE_ANIMATION } from 'Style/Animations';

export default function Layout() {
  return (
    <Stack
      screenOptions={ {
        headerShown: false,
        animation: DEFAULT_ROUTE_ANIMATION,
      } }
    />
  );
}
