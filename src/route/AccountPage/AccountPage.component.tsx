import Loader from 'Component/Loader';
import Page from 'Component/Page';
import ThemedButton from 'Component/ThemedButton';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import { router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import NavigationStore from 'Store/Navigation.store';
import ServiceStore from 'Store/Service.store';
import { scale } from 'Util/CreateStyles';

import { styles } from './AccountPage.style';
import { AccountPageComponentProps } from './AccountPage.type';

export function AccountPageComponent({
  isLoading,
  login,
}: AccountPageComponentProps) {
  const loginRef = useRef({ username: '', password: '' });

  const renderTopBar = () => {
    const badge = NavigationStore.badgeData['(account)'] ?? 0;

    return (
      <View style={ styles.topBar }>
        <View>
          <ThemedButton
            style={ styles.tobBarBtn }
            iconStyle={ styles.tobBarBtnIcon }
            icon={ {
              name: 'bell-outline',
              pack: IconPackType.MaterialCommunityIcons,
            } }
            iconSize={ scale(24) }
            onPress={ () => router.push({
              pathname: '/(tabs)/(account)/(notifications)/notifications',
            }) }
          />
          { badge > 0 && (
            <View style={ styles.badge } />
          ) }
        </View>
        <ThemedButton
          style={ styles.tobBarBtn }
          iconStyle={ styles.tobBarBtnIcon }
          icon={ {
            name: 'settings-outline',
            pack: IconPackType.Ionicons,
          } }
          iconSize={ scale(24) }
          onPress={ () => router.push({
            pathname: '/(tabs)/(account)/settings',
          }) }
        />
      </View>
    );
  };

  const renderContent = () => {
    if (!ServiceStore.isSignedIn) {
      return (
        <View>
          <ThemedText>
            Please sign in
          </ThemedText>
          <TextInput
            placeholder="Username"
            onChangeText={ (t) => { loginRef.current.username = t; } }
          />
          <TextInput
            placeholder="Password"
            onChangeText={ (t) => { loginRef.current.password = t; } }
          />
          <ThemedButton onPress={ () => login(
            loginRef.current.username,
            loginRef.current.password,
          ) }
          >
            Login
          </ThemedButton>
        </View>
      );
    }

    return (
      <View>
        <ThemedText>Logged in</ThemedText>
      </View>
    );
  };

  const renderLoader = () => (
    <Loader
      isLoading={ isLoading }
      fullScreen
    />
  );

  return (
    <Page>
      <View>
        { renderTopBar() }
        { renderContent() }
        { renderLoader() }
      </View>
    </Page>
  );
}

export default observer(AccountPageComponent);
