import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import ThemedText from 'Component/ThemedText';
import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { DefaultFocus, SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import Colors from 'Style/Colors';

// Text input with a touchable wrapper to manage focus on TV
const WrappedTextInput = (props: React.ComponentProps<any>) => {
  const textInputRef = useRef<any>();

  return (
    <SpatialNavigationFocusableView
      onSelect={ () => textInputRef.current?.focus() }
    >

      { ({ isFocused, isRootActive }) => (
        <TextInput
          { ...props }
          autoComplete="off"
          ref={ textInputRef }
          mode="outlined"
          style={ isFocused && { backgroundColor: Colors.lightGray } }
        />
      ) }
    </SpatialNavigationFocusableView>
  );
};

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
        <DefaultFocus>
          <SpatialNavigationFocusableView>
            <WrappedTextInput
              placeholder="Username"
              onChangeText={ (t) => { credsRef.current.username = t; } }
            />
          </SpatialNavigationFocusableView>
          <SpatialNavigationFocusableView>
            <WrappedTextInput
              placeholder="Password"
              onChangeText={ (t) => { credsRef.current.password = t; } }
            />
          </SpatialNavigationFocusableView>
          <ThemedButton onPress={ login }>
            Login
          </ThemedButton>
        </DefaultFocus>
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
