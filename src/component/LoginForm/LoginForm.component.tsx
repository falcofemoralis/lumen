import InfoBlock from 'Component/InfoBlock';
import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedInput from 'Component/ThemedInput';
import { router } from 'expo-router';
import t from 'i18n/t';
import { useRef } from 'react';
import { View } from 'react-native';
import RouterStore from 'Store/Router.store';

import { styles } from './LoginForm.style';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  withRedirect,
  handleLogin,
}: LoginFormComponentProps) {
  const loginRef = useRef({ username: '', password: '' });

  const openForm = () => {
    router.push({ pathname: '/modal' });
    RouterStore.pushData('modal', {
      type: 'login',
    });
  };

  const renderForm = () => {
    if (withRedirect) {
      return (
        <ThemedButton
          style={ styles.form }
          contentStyle={ styles.formContent }
          onPress={ openForm }
        >
          { t('Go to login page') }
        </ThemedButton>
      );
    }

    return (
      <View style={ styles.form }>
        <ThemedInput
          style={ styles.input }
          placeholder={ t('Login or email') }
          onChangeText={ (text) => { loginRef.current.username = text; } }
        />
        <ThemedInput
          style={ styles.input }
          placeholder={ t('Password') }
          onChangeText={ (text) => { loginRef.current.password = text; } }
        />
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
    <View style={ styles.container }>
      <InfoBlock
        title={ t('You are not logged in') }
        subtitle={ t('Sign in to sync content') }
      />
      { renderForm() }
    </View>
  );
}

export default LoginFormComponent;
