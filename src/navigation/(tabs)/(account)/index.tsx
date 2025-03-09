import { DEFAULT_ROUTE } from 'Component/NavigationBar/NavigationBar.config';
import { router, useFocusEffect } from 'expo-router';
import { observer } from 'mobx-react-lite';
import AccountPage from 'Route/AccountPage';
import RouterStore from 'Store/Router.store';

export function AccountScreen() {
  useFocusEffect(() => {
    if (!RouterStore.isAppLoaded) {
      RouterStore.setAppLoaded();

      console.log('redirect');

      // Call the replace method to redirect to a new route without adding to the history.
      // We do this in a useFocusEffect to ensure the redirect happens every time the screen
      // is focused.
      router.replace(`/(tabs)/${DEFAULT_ROUTE}`);
    }
  });

  if (!RouterStore.isAppLoaded) {
    return null;
  }

  return <AccountPage />;
}

export default observer(AccountScreen);
