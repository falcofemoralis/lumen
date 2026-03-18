import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { LOGIN_MODAL_SCREEN } from 'Navigation/navigationRoutes';
import { useRef } from 'react';
import { View } from 'react-native';
import { goBack, navigate } from 'Util/Navigation';

import { componentStyles } from './LoginForm.style';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  withRedirect,
  style,
  children,
  handleLogin,
}: LoginFormComponentProps) {
  const loginRef = useRef({ username: '', password: '' });
  const styles = useThemedStyles(componentStyles);

  const onLogin = async () => {
    const success = await handleLogin(loginRef.current.username, loginRef.current.password);

    if (success) {
      goBack();
    }
  };

  const openForm = () => {
    navigate(LOGIN_MODAL_SCREEN);
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
      { children }
    </View>
  );
}

export default LoginFormComponent;
