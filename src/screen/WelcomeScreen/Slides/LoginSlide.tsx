import { ConfirmOverlay } from 'Component/ConfirmOverlay';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useIsTV } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import Info from 'lucide-react-native/icons/info';
import LogIn from 'lucide-react-native/icons/log-in';
import {
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  Linking,
  View,
} from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';

import { BaseSlide, BaseSlideProps } from './BaseSlide';

export const LoginSlide = ({
  goNext,
  styles,
  ...props
}: BaseSlideProps) => {
  const { theme, scale } = useAppTheme();
  const isTV = useIsTV();
  const { profile, currentService, isSignedIn, login } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const usernameRef = useRef<string | null>(null);
  const passwordRef = useRef<string | null>(null);
  const registrationOverlayRef = useRef<ThemedOverlayRef>(null);
  const confirmOverlayRef = useRef<ThemedOverlayRef>(null);

  const handleNext = useCallback(() => {
    if (currentService.isOfficialMode() && !isSignedIn) {
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

  const handleRegistration = useCallback(() => {
    registrationOverlayRef.current?.open();
  }, []);

  const handleOpenEmail = useCallback(() => {
    Linking.openURL(`mailto:${currentService.supportEmail}`);
  }, [currentService]);

  const renderLoginForm = () => (
    <View style={ styles.loginWrapper }>
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
      <ThemedPressable
        style={ styles.loginButton }
        contentStyle={ [
          styles.loginButtonContent,
          isLoading && styles.loginButtonDisabled,
        ] }
        onPress={ handleLogin }
        disabled={ isLoading }
      >
        { ({ isFocused }) => (
          <View style={ [
            styles.loginButtonInner,
            isFocused && styles.TVfocused,
          ] }
          >
            <LogIn
              color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
            />
            <ThemedText
              style={ [
                styles.loginButtonText,
                isFocused && styles.TVfocusedText,
              ] }
            >
              { t('Sign in') }
            </ThemedText>
          </View>
        ) }
      </ThemedPressable>
      <View style={ styles.registrationContainer }>
        <ThemedText
          style={ [
            styles.providerButtonText,
          ] }
        >
          { t('No Account?') }
        </ThemedText>
        <ThemedPressable onPress={ handleRegistration }>
          { ({ isFocused }) => (
            <ThemedText style={ [
              styles.signUpText,
              isFocused && styles.signUpTextFocused,
            ] }
            >
              { t('Sign Up') }
            </ThemedText>
          ) }
        </ThemedPressable>
      </View>
      <ConfirmOverlay
        overlayRef={ confirmOverlayRef }
        onConfirm={ () => confirmOverlayRef.current?.close() }
        title={ t('Official mode requires sign-in') }
        message={ t('You are currently in official mode but not signed in. Please sign in to continue.') }
        confirmButtonText={ t('OK') }
        disableCancelButton
      />
      <ThemedOverlay ref={ registrationOverlayRef } contentContainerStyle={ isTV && styles.registrationOverlayTV }>
        <View style={ styles.registrationOverlay }>
          <View style={ styles.registrationRow }>
            <View style={ styles.registrationRowWrapper }>
              <ThemedText style={ styles.registrationRowNumber }>
                1
              </ThemedText>
              <ThemedText style={ styles.registrationRowTitle }>
                { t('Send any text to the email.') }
              </ThemedText>
            </View>
            <View style={ styles.registrationRowContent }>
              <ThemedPressable
                style={ styles.supportEmailButton }
                onPress={ handleOpenEmail }
              >
                { ({ isFocused }) => (
                  <ThemedText
                    style={ [
                      styles.supportEmailButtonText,
                      isFocused && styles.supportEmailButtonTextFocused,
                    ] }
                  >
                    { currentService.supportEmail }
                  </ThemedText>
                ) }
              </ThemedPressable>
            </View>
          </View>
          <View style={ styles.registrationRow }>
            <View style={ styles.registrationRowWrapper }>
              <ThemedText style={ styles.registrationRowNumber }>
                2
              </ThemedText>
              <ThemedText style={ styles.registrationRowTitle }>
                { t('Check your email for the response email.') }
              </ThemedText>
            </View>
            <View style={ styles.registrationRowContent }>
              <View style={ styles.registrationHintContainer }>
                <Info
                  color={ theme.colors.icon }
                  size={ scale(18) }
                />
                <ThemedText style={ styles.registrationHint }>
                  { t('If email not received, check your spam folder.') }
                </ThemedText>
              </View>
              <View style={ styles.registrationHintContainer }>
                <Info
                  color={ theme.colors.icon }
                  size={ scale(18) }
                />
                <ThemedText style={ styles.registrationHint }>
                  { t('Do not need to change provider in the app, just use official mode.') }
                </ThemedText>
              </View>
            </View>
          </View>
          <View style={ styles.registrationRow }>
            <View style={ styles.registrationRowWrapper }>
              <ThemedText style={ styles.registrationRowNumber }>
                3
              </ThemedText>
              <ThemedText style={ styles.registrationRowTitle }>
                { t('Use data from the email to sign in.') }
              </ThemedText>
            </View>
          </View>
          <View style={ styles.registrationRowContent }>
            <View style={ styles.registrationConfirmButtonWrapper }>
              <ThemedButton
                title={ t('Authorize') }
                style={ styles.registrationConfirmButton }
                onPress={ () => registrationOverlayRef.current?.close() }
              />
            </View>
          </View>
        </View>
      </ThemedOverlay>
    </View>
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
