import NavigationBar from 'Component/NavigationBar';
import { Redirect } from 'expo-router';
import ConfigStore from 'Store/Config.store';

export function TabsLayout() {
  if (!ConfigStore.isConfigured()) {
    return <Redirect href="/welcome" />;
  }

  return <NavigationBar />;
}

export default TabsLayout;
