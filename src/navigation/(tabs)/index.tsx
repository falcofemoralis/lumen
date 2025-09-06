import { Redirect } from 'expo-router';

export function IndexScreen() {
  return <Redirect href='/(tabs)/(home)/home' />;
}

export default IndexScreen;