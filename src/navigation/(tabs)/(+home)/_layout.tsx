import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={ {
        headerShown: false,
        animation: 'fade',
      } }
    >
      <Stack.Screen
        name="modal"
        options={ {
          presentation: 'modal',
        } }
      />
    </Stack>
  );
}
