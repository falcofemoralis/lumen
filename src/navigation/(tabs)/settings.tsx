import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedText from 'Component/ThemedText';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';

export function SettingsScreen() {
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
        <ThemedText>Logged in</ThemedText>
      );
    }

    return (
      <View>
        <SpatialNavigationFocusableView>
          <TextInput
            placeholder="Username"
            onChangeText={ (t) => { credsRef.current.username = t; } }
          />
        </SpatialNavigationFocusableView>
        <SpatialNavigationFocusableView>
          <TextInput
            placeholder="Password"
            onChangeText={ (t) => { credsRef.current.password = t; } }
          />
        </SpatialNavigationFocusableView>
        <ThemedButton onPress={ login }>
          Login
        </ThemedButton>
      </View>
    );
  };

  return (
    <Page>
      <ThemedText>Settings page</ThemedText>
      { renderContent() }
    </Page>
  );
}

export default observer(SettingsScreen);
