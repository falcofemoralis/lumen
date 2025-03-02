import { DEFAULT_ROUTE } from 'Component/NavigationBar/NavigationBar.config';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedText from 'Component/ThemedText';
import { Redirect } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';

export function AccountScreen() {
  const credsRef = useRef({ username: '', password: '' });

  const login = async () => {
    try {
      await ServiceStore.login(credsRef.current.username.trim(), credsRef.current.password.trim());

      NotificationStore.displayMessage('Login successful!!!');
    } catch (e) {
      NotificationStore.displayError(e as Error);
    }
  };

  const renderContent = () => {
    if (ServiceStore.isSignedIn) {
      return (
        <View>
          <TouchableOpacity onPress={ () => { ServiceStore.login('qwe', 'qwe'); } }>
            <ThemedText>TESRQW</ThemedText>
          </TouchableOpacity>
          <ThemedText>Logged in</ThemedText>
        </View>
      );
    }

    return (
      <View>
        <TextInput
          placeholder="Username"
          onChangeText={ (t) => { credsRef.current.username = t; } }
        />
        <TextInput
          placeholder="Password"
          onChangeText={ (t) => { credsRef.current.password = t; } }
        />
        <ThemedButton onPress={ login }>
          Login
        </ThemedButton>
      </View>
    );
  };

  // TODO add initial loading
  if (ConfigStore.isTV) {
    return (
      <Redirect
        relativeToDirectory
        href={ `/(tabs)/${DEFAULT_ROUTE}` }
      />
    );
  }

  return (
    <Page>
      <ThemedText>Account page</ThemedText>
      { renderContent() }
    </Page>
  );
}

export default observer(AccountScreen);
