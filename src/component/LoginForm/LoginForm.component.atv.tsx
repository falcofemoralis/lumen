import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';

import { componentStyles } from './LoginForm.style.atv';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  children,
  autofocus,
  handleLogin,
}: LoginFormComponentProps) {
  const loginRef = useRef({ username: '', password: '' });
  const styles = useThemedStyles(componentStyles);
  const overlayRef = useRef<ThemedOverlayRef>(null);

  const onLogin = useCallback(async () => {
    const success = await handleLogin(loginRef.current.username, loginRef.current.password);

    if (success) {
      overlayRef.current?.close();
    }
  }, [handleLogin]);

  const renderInfoBlock = () => (
    <InfoBlock
      title={ t('You are not logged in') }
      subtitle={ t('Sign in to sync content') }
    />
  );

  const renderButton = () => (
    <ThemedButton
      title={ t('Log In') }
      onPress={ () => overlayRef?.current?.open() }
      autofocus={ autofocus }
    />
  );

  const renderForm = () => (
    <View style={ styles.form }>
      <View style={ styles.heading }>
        <ThemedText style={ styles.title }>
          { t('Log In') }
        </ThemedText>
        <ThemedText style={ styles.subtitle }>
          { t('Enter your credentials to continue') }
        </ThemedText>
      </View>
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
          secureTextEntry
        />
      </View>
      <ThemedButton
        title={ t('Sign in') }
        style={ styles.button }
        onPress={ onLogin }
      />
      <Loader
        isLoading={ isLoading }
        fullScreen
      />
    </View>
  );

  const renderModal = () => (
    <ThemedOverlay
      ref={ overlayRef }
      contentContainerStyle={ styles.overlay }
      useKeyboardAdjustment
    >
      { renderForm() }
    </ThemedOverlay>
  );

  return (
    <View
      style={ styles.container }
    >
      { renderModal() }
      { renderInfoBlock() }
      { renderButton() }
      { children }
    </View>
  );
}

export default LoginFormComponent;
