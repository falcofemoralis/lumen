import { InfoBlock } from 'Component/InfoBlock';
import { Loader } from 'Component/Loader';
import { ThemedBottomSheet } from 'Component/ThemedBottomSheet';
import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';

import { componentStyles } from './LoginForm.style';
import { LoginFormComponentProps } from './LoginForm.type';

export function LoginFormComponent({
  isLoading,
  style,
  children,
  handleLogin,
}: LoginFormComponentProps) {
  const loginRef = useRef({ username: '', password: '' });
  const styles = useThemedStyles(componentStyles);
  const sheetRef = useRef<ThemedBottomSheetRef>(null);

  const onLogin = useCallback(async () => {
    const success = await handleLogin(loginRef.current.username, loginRef.current.password);

    if (success) {
      sheetRef.current?.dismiss();
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
      onPress={ () => sheetRef?.current?.present() }
    />
  );

  const renderForm = () => (
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
        title={ t('Sign in') }
        style={ styles.action }
        onPress={ onLogin }
      />
      <Loader
        isLoading={ isLoading }
        fullScreen
      />
    </View>
  );

  const renderModal = () => (
    <ThemedBottomSheet
      ref={ sheetRef }
      detents={ ['auto'] }
    >
      <Wrapper>
        { renderForm() }
      </Wrapper>
    </ThemedBottomSheet>
  );

  return (
    <View style={ [styles.container, style] }>
      { renderModal() }
      { renderInfoBlock() }
      { renderButton() }
      { children }
    </View>
  );
}

export default LoginFormComponent;
