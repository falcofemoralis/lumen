import NavigationBar from 'Component/NavigationBar';
import { useServiceContext } from 'Context/ServiceContext';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import ConfigStore from 'Store/Config.store';

export function TabsLayout() {
  const { isSignedIn, getNotifications } = useServiceContext();

  useEffect(() => {
    if (isSignedIn) {
      getNotifications();
    }
  }, [isSignedIn, getNotifications]);

  if (!ConfigStore.isConfigured()) {
    return <Redirect href="/welcome" />;
  }

  return <NavigationBar />;
}

export default TabsLayout;
