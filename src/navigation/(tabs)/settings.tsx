import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedText from 'Component/ThemedText';
import { useRef } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';

export default function SettingsScreen() {
  const credsRef = useRef({ username: '', password: '' });

  const login = async () => {
    try {
      await ServiceStore.login(credsRef.current.username, credsRef.current.password);

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
