import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedText from 'Component/ThemedText';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';

export default function AccountScreen() {
  const login = async () => {
    try {
      await ServiceStore.login('', '');

      NotificationStore.displayMessage('Login successful!!!');
    } catch (e) {
      NotificationStore.displayError(e as Error);
    }
  };

  return (
    <Page>
      <ThemedText>Account page</ThemedText>
      <ThemedButton onPress={ login }>
        Login
      </ThemedButton>
    </Page>
  );
}
