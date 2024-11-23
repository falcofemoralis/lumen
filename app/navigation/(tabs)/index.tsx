import { Redirect } from 'expo-router';
import HomePage from 'Route/HomePage';
import ConfigStore from 'Store/Config.store';

export function HomeScreen() {
  if (!ConfigStore.isConfigured) {
    return <Redirect href="/welcome" />;
  }

  return <HomePage />;
}

export default HomeScreen;
