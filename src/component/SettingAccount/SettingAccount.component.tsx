import { Loader } from 'Component/Loader';
import { SettingBase } from 'Component/SettingBase';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { memo, useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { componentStyles } from './SettingAccount.style';
import { SettingAccountComponentProps } from './SettingAccount.type';

export const SettingAccountComponent = memo(({
  account,
  onLogin,
  onLogout,
  ...baseProps
}: SettingAccountComponentProps) => {
  const { title } = baseProps;
  const styles = useThemedStyles(componentStyles);
  const overlayRef = useRef<ThemedOverlayRef>(null);
  const credentialsRef = useRef({ name: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const onSignIn = useCallback(async () => {
    const name = credentialsRef.current.name.trim();
    const password = credentialsRef.current.password.trim();

    if (!name || !password) {
      return;
    }

    setIsLoading(true);

    try {
      if (await onLogin(name, password)) {
        overlayRef.current?.close();
      }
    } finally {
      setIsLoading(false);
    }
  }, [onLogin]);

  // signed in, the only thing left to do with it is to sign out
  if (account !== null) {
    return (
      <SettingBase
        { ...baseProps }
        subtitle={ account || t('Logged in') }
        confirmation={ { title: t('Log out of this account?') } }
        onPress={ onLogout }
      />
    );
  }

  return (
    <View>
      <SettingBase
        { ...baseProps }
        onPress={ () => overlayRef.current?.open() }
      />
      <ThemedOverlay
        ref={ overlayRef }
        contentContainerStyle={ styles.overlay }
        useKeyboardAdjustment
      >
        <ThemedText style={ styles.overlayTitle }>
          { title }
        </ThemedText>
        <ThemedInput
          style={ styles.overlayInput }
          placeholder={ t('Login or email') }
          onChangeText={ (text) => { credentialsRef.current.name = text; } }
        />
        <ThemedInput
          style={ styles.overlayInput }
          placeholder={ t('Password') }
          onChangeText={ (text) => { credentialsRef.current.password = text; } }
          secureTextEntry
        />
        <ThemedButton
          title={ t('Sign in') }
          style={ styles.overlayButton }
          onPress={ onSignIn }
        />
        <Loader
          isLoading={ isLoading }
          fullScreen
        />
      </ThemedOverlay>
    </View>
  );
});

export default SettingAccountComponent;
