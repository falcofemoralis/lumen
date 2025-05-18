import AccountPage from 'Route/AccountPage';

export function AccountScreen() {
  // useFocusEffect(() => {
  //   if (!RouterStore.isAppLoaded) {
  //     RouterStore.setAppLoaded();

  //     // Call the replace method to redirect to a new route without adding to the history.
  //     // We do this in a useFocusEffect to ensure the redirect happens every time the screen
  //     // is focused.
  //     router.replace(`/(tabs)/${DEFAULT_ROUTE}`);
  //   }
  // });

  // if (!RouterStore.isAppLoaded) {
  //   return null;
  // }

  return <AccountPage />;
}

export default AccountScreen;
