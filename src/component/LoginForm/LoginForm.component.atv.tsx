import InfoBlock from 'Component/InfoBlock';
import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedInput from 'Component/ThemedInput';
import { router } from 'expo-router';
import t from 'i18n/t';
import { useRef } from 'react';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';

import { styles } from './LoginForm.style.atv';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  withRedirect,
  handleLogin,
}: LoginFormComponentProps) {
  const loginRef = useRef({ username: '', password: '' });

  const renderForm = () => {
    if (withRedirect) {
      return (
        <ThemedButton
          style={ styles.form }
          onPress={ () => router.navigate('/(tabs)/(account)') }
        >
          { t('Go to login page') }
        </ThemedButton>
      );
    }

    return (
      <View style={ styles.form }>
        <View style={ styles.inputContainer }>
          <ThemedInput
            style={ styles.input }
            placeholder={ t('Login or email') }
            onChangeText={ (text) => { loginRef.current.username = text; } }
          />
        </View>
        <View style={ styles.inputContainer }>
          <ThemedInput
            style={ styles.input }
            placeholder={ t('Password') }
            onChangeText={ (text) => { loginRef.current.password = text; } }
          />
        </View>
        <ThemedButton
          style={ styles.button }
          onPress={ () => handleLogin(
            loginRef.current.username,
            loginRef.current.password
          ) }
        >
          { t('Sign in') }
        </ThemedButton>
        <Loader
          isLoading={ isLoading }
          fullScreen
        />
      </View>
    );
  };

  return (
    <DefaultFocus>
      <View
        style={ styles.container }
      >
        <InfoBlock
          title={ t('You are not logged in') }
          subtitle={ t('Sign in to sync content') }
        />
        { renderForm() }
      </View>
    </DefaultFocus>
  );
}

export default LoginFormComponent;
