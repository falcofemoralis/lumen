import { useNavigation } from '@react-navigation/native';
import InfoBlock from 'Component/InfoBlock';
import Loader from 'Component/Loader';
import ThemedButton from 'Component/ThemedButton';
import ThemedInput from 'Component/ThemedInput';
import t from 'i18n/t';
import { useRef } from 'react';
import { View } from 'react-native';
import { LOGIN_MODAL_ROUTE } from 'Route/modal/LoginModal/LoginModal.config';

import { styles } from './LoginForm.style';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  withRedirect,
  style,
  handleLogin,
}: LoginFormComponentProps) {
  const navigation = useNavigation();
  const loginRef = useRef({ username: '', password: '' });

  const onLogin = async () => {
    const success = await handleLogin(loginRef.current.username, loginRef.current.password);

    if (success) {
      navigation.goBack();
    }
  };

  const openForm = () => {
    navigation.navigate(LOGIN_MODAL_ROUTE);
  };

  const renderForm = () => {
    if (withRedirect) {
      return (
        <ThemedButton
          style={ styles.modalButton }
          contentStyle={ styles.modalButtonContent }
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
          secureTextEntry
        />
        <ThemedButton
          style={ styles.button }
          onPress={ onLogin }
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

  const renderInfoBlock = () => {
    return (
      <InfoBlock
        title={ t('You are not logged in') }
        subtitle={ t('Sign in to sync content') }
      />
    );
  };

  return (
    <View style={ [styles.container, withRedirect && styles.redirectContainer, style] }>
      { renderInfoBlock() }
      { renderForm() }
    </View>
  );
}

export default LoginFormComponent;
