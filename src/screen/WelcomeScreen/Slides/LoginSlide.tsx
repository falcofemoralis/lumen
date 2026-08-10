import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { Loader } from 'Component/Loader';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGroup } from 'Component/ThemedGroup';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import LogIn from 'lucide-react-native/icons/log-in';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
} from 'react-native';
import NotificationStore from 'Store/Notification.store';

import { BaseSlide, BaseSlideProps, NEXT_BUTTON_FOCUS_KEY } from './BaseSlide';

const SIGN_IN_FOCUS_KEY = 'SIGN_IN';

export const LoginSlide = ({
  goNext,
  styles,
  ...props
}: BaseSlideProps) => {
  const { profile, currentService, isSignedIn, login } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const usernameRef = useRef<string | null>(null);
  const passwordRef = useRef<string | null>(null);
  const confirmOverlayRef = useRef<ThemedOverlayRef>(null);

  useEffect(() => {
    if (isSignedIn) {
      setFocus(NEXT_BUTTON_FOCUS_KEY);
    }
  }, [isSignedIn]);

  const handleNext = useCallback(() => {
    if (currentService.getConfig('officialMode') && !isSignedIn) {
      confirmOverlayRef.current?.open();

      return;
    }

    goNext?.();
  }, [currentService, goNext, isSignedIn]);

  const handleLogin = useCallback(async () => {
    setIsLoading(true);

    if (!usernameRef.current || !passwordRef.current) {
      NotificationStore.displayMessage(t('Please enter username and password'));
      setIsLoading(false);

      return;
    }

    try {
      await login(
        usernameRef.current ?? '',
        passwordRef.current ?? ''
      );
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const renderLoginForm = () => (
    <ThemedGroup
      style={ styles.loginWrapper }
      preferredChildFocusKey={ SIGN_IN_FOCUS_KEY }
    >
      <View style={ styles.loginInputs }>
        <ThemedInput
          style={ isLoading && styles.providerValidateButtonDisabled }
          placeholder={ t('Login or email') }
          onChangeText={ username => usernameRef.current = username }
        />
        <ThemedInput
          style={ isLoading && styles.providerValidateButtonDisabled }
          placeholder={ t('Password') }
          onChangeText={ password => passwordRef.current = password }
          secureTextEntry
        />
      </View>
      <View style={ styles.loginButtons }>
        <ThemedButton
          title={ t('Sign in') }
          style={ styles.loginButton }
          onPress={ handleLogin }
          disabled={ isLoading }
          focusKey={ SIGN_IN_FOCUS_KEY }
          IconComponent={ LogIn }
        />
      </View>
      <Loader isLoading={ isLoading } fullScreen />
      <ConfirmOverlay
        overlayRef={ confirmOverlayRef }
        onConfirm={ () => confirmOverlayRef.current?.close() }
        title={ t('Official mode requires sign-in') }
        message={ t('You are currently in official mode but not signed in. Please sign in to continue.') }
        confirmButtonText={ t('OK') }
        disableCancelButton
      />
    </ThemedGroup>
  );

  const renderContent = () => {
    if (profile) {
      return null;
    }

    return renderLoginForm();
  };

  return (
    <BaseSlide
      { ...props }
      goNext={ handleNext }
      style={ styles.loginSlide }
      customImage={ profile?.avatar }
      customTitle={ profile ? t('Welcome back, {{user}}!', { user: profile.name }) : undefined }
      customSubtitle={ profile?.email }
      styles={ styles }
    >
      { renderContent() }
    </BaseSlide>
  );
};
