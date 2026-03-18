import { InfoBlock } from 'Component/InfoBlock';
import { KeyboardAdjuster } from 'Component/KeyboardAdjuster';
import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { ACCOUNT_SCREEN } from 'Navigation/navigationRoutes';
import { useRef } from 'react';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';
import { navigate } from 'Util/Navigation';

import { componentStyles } from './LoginForm.style.atv';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  withRedirect,
  children,
  handleLogin,
}: LoginFormComponentProps) {
  const loginRef = useRef({ username: '', password: '' });
  const styles = useThemedStyles(componentStyles);

  const renderForm = () => {
    if (withRedirect) {
      return (
        <ThemedButton
          style={ styles.form }
          onPress={ () => navigate(ACCOUNT_SCREEN) }
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
            withAnimation
          />
        </View>
        <View style={ styles.inputContainer }>
          <ThemedInput
            style={ styles.input }
            placeholder={ t('Password') }
            onChangeText={ (text) => { loginRef.current.password = text; } }
            secureTextEntry
            withAnimation
          />
        </View>
        <ThemedButton
          style={ styles.button }
          onPress={ () => handleLogin(
            loginRef.current.username,
            loginRef.current.password
          ) }
          withAnimation
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
    <View
      style={ styles.container }
    >
      <InfoBlock
        title={ t('You are not logged in') }
        subtitle={ t('Sign in to sync content') }
      />
      { renderForm() }
      { children }
      <KeyboardAdjuster />
    </View>
  );
}

export default LoginFormComponent;
