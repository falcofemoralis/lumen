import { KeyboardAdjuster } from 'Component/KeyboardAdjuster';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedCustomSelect } from 'Component/ThemedCustomSelect';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedInput } from 'Component/ThemedInput';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { Portal } from 'Component/ThemedPortal';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedFocusableNodeState } from 'Component/ThemedPressable/ThemedPressable.type';
import { ThemedText } from 'Component/ThemedText';
import { ThemedToggle } from 'Component/ThemedToggle';
import { useConfigContext } from 'Context/ConfigContext';
import { useOverlayContext } from 'Context/OverlayContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLandscape } from 'Hooks/useLandscape';
import { t } from 'i18n/translate';
import { Check, ChevronLeft, CircleAlert, Info, LogIn, RefreshCw } from 'lucide-react-native';
import {
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  Image,
  ImageSourcePropType,
  Linking,
  Pressable,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationNodeRef,
  SpatialNavigationRoot,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { FilmInterface } from 'Type/Film.interface';
import { SpatialNavigationKeyboardLocker } from 'Util/RemoteControl/SpatialNavigationKeyboardLocker';

import { TEST_URL } from './WelcomeScreen.config';
import { componentStyles } from './WelcomeScreen.style';
import { DeviceType, SlideInterface } from './WelcomeScreen.type';
import { WelcomeScreenMobile, WelcomeScreenTV } from './WelcomeScreenIcons';

export type SlideProps = {
  slide: SlideInterface;
  goBack: (slide: SlideInterface) => void;
  goNext: (slide: SlideInterface) => void;
  styles: ThemedStyles<typeof componentStyles>;
}

export type BaseSlideProps = {
  slide: SlideInterface;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  canNext?: boolean;
  canBack?: boolean;
  canComplete?: boolean;
  customImage?: string;
  customTitle?: string;
  customSubtitle?: string;
  image?: ImageSourcePropType;
  complete?: () => void;
  goBack?: (slide: SlideInterface) => void;
  goNext?: (slide: SlideInterface) => void;
  onNext?: () => void;
  styles: ThemedStyles<typeof componentStyles>
}

export const BaseSlide = ({
  slide,
  children,
  style,
  canNext = true,
  canBack = true,
  canComplete = false,
  customImage,
  customTitle,
  customSubtitle,
  image,
  complete,
  goBack,
  goNext,
  onNext,
  styles,
}: BaseSlideProps) => {
  const isLandscape = useLandscape();
  const nextButtonRef = useRef<SpatialNavigationNodeRef>(null);
  const { theme, scale } = useAppTheme();
  const { isOverlayOpen } = useOverlayContext();

  const renderBaseSlide = () => {
    const {
      IconComponent,
      title,
      subtitle,
    } = slide;

    return (
      <View
        style={ [
          styles.info,
          isLandscape && styles.infoLandscape,
        ] }
      >
        { image && (
          <Image
            source={ image }
            style={ styles.image }
          />
        ) }
        { customImage && (
          <ThemedImage
            src={ customImage }
            style={ styles.customImage }
          />
        ) }
        { IconComponent && !customImage && !image && (
          <View style={ styles.iconContainer }>
            <IconComponent
              style={ styles.icon }
              size={ scale(28) }
              color={ theme.colors.icon }
            />
          </View>
        ) }
        <ThemedText style={ styles.title }>
          { customTitle ?? title }
        </ThemedText>
        <ThemedText style={ styles.subtitle }>
          { customSubtitle ?? subtitle }
        </ThemedText>
      </View>
    );
  };

  const renderBaseNavigation = () => {
    const handleBack = () => {
      goBack?.(slide);
    };

    const handleNext = () => {
      goNext?.(slide);
      onNext?.();
    };

    return (
      <SpatialNavigationView direction='horizontal' style={ styles.navigation }>
        { canBack && (
          <View style={ styles.prevButtonContainer }>
            <SlidePressable
              style={ styles.prevButton }
              contentStyle={ styles.prevButtonContent }
              onPress={ handleBack }
              styles={ styles }
            >
              { ({ isFocused }) => (
                <ChevronLeft
                  size={ scale(24) }
                  color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
                />
              ) }
            </SlidePressable>
          </View>
        ) }
        <DefaultFocus>
          { (canNext || canComplete) && (
            <SlidePressable
              spatialRef={ nextButtonRef }
              style={ styles.nextButtonPressable }
              contentStyle={ styles.nextButtonContent }
              spatialStyle={ [
                styles.nextButton,
                isLandscape && styles.nextButtonLandscape,
              ] }
              onPress={ canComplete ? complete : handleNext }
              styles={ styles }
            >
              { ({ isFocused }) => (
                <ThemedText
                  style={ [
                    styles.buttonText,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { canComplete ? t('Complete') : t('Next') }
                </ThemedText>
              ) }
            </SlidePressable>
          ) }
        </DefaultFocus>
      </SpatialNavigationView>
    );
  };

  return (
    <SpatialNavigationRoot>
      <Portal.Host>
        <SpatialNavigationKeyboardLocker />
        <ScrollView
          contentContainerStyle={ [
            styles.container,
            isLandscape && styles.containerLandscape,
            style,
          ] }
        >
          { renderBaseSlide() }
          { children }
          <KeyboardAdjuster isActive={ !isOverlayOpen } />
          { renderBaseNavigation() }
        </ScrollView>
      </Portal.Host>
    </SpatialNavigationRoot>
  );
};

type ConfigureSlideProps = SlideProps & {
  selectedDeviceType: DeviceType | null;
  configureDeviceType: (type: DeviceType) => void;
};

export const ConfigureSlide = ({
  slide,
  selectedDeviceType,
  goBack,
  goNext,
  configureDeviceType,
  styles,
}: ConfigureSlideProps) => {
  const { theme } = useAppTheme();

  const handleNext = useCallback((s: SlideInterface) => {
    if (!selectedDeviceType) {
      NotificationStore.displayMessage(t('Please select a device type'));

      return;
    }

    goNext(s);
  }, [selectedDeviceType, goNext]);

  const handleSelectTV = useCallback(() => {
    configureDeviceType(DeviceType.TV);
  }, [configureDeviceType]);

  const handleSelectMobile = useCallback(() => {
    configureDeviceType(DeviceType.MOBILE);
  }, [configureDeviceType]);

  return (
    <BaseSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ handleNext }
      styles={ styles }
    >
      <View style={ styles.configureWrapper }>
        <SlidePressable
          style={ styles.configureButtonPressable }
          contentStyle={ [
            styles.configureButtonContent,
            selectedDeviceType === DeviceType.TV && styles.configureButtonSelected,
          ] }
          spatialStyle={ styles.configureButton }
          onPress={ handleSelectTV }
          styles={ styles }
        >
          { ({ isFocused }) => (
            <View style={ styles.configureContainer }>
              <View style={ styles.configureIcon }>
                <WelcomeScreenTV
                  color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
                />
              </View>
              <View style={ styles.configureInfo }>
                <ThemedText
                  style={ [
                    styles.configureTitle,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { t('TV Version') }
                </ThemedText>
                <ThemedText
                  style={ [
                    styles.configureSubtitle,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { t('Suits for TV') }
                </ThemedText>
              </View>
            </View>
          ) }
        </SlidePressable>
        <SlidePressable
          style={ styles.configureButtonPressable }
          contentStyle={ [
            styles.configureButtonContent,
            selectedDeviceType === DeviceType.MOBILE && styles.configureButtonSelected,
          ] }
          spatialStyle={ styles.configureButton }
          onPress={ handleSelectMobile }
          styles={ styles }
        >
          { ({ isFocused }) => (
            <View style={ styles.configureContainer }>
              <View style={ styles.configureIcon }>
                <WelcomeScreenMobile
                  color={ isFocused ? theme.colors.iconFocused : theme.colors.icon }
                />
              </View>
              <View style={ styles.configureInfo }>
                <ThemedText
                  style={ [
                    styles.configureTitle,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { t('Mobile Version') }
                </ThemedText>
                <ThemedText
                  style={ [
                    styles.configureSubtitle,
                    isFocused && styles.TVfocusedText,
                  ] }
                >
                  { t('Suits for mobile') }
                </ThemedText>
              </View>
            </View>
          ) }
        </SlidePressable>
      </View>
    </BaseSlide>
  );
};

type ProviderSlideProps = SlideProps & {
};

export const ProviderSlide = ({
  slide,
  goBack,
  goNext,
  styles,
}: ProviderSlideProps) => {
  const { theme } = useAppTheme();
  const { currentService, updateProvider, updateOfficialMode, logout, validateUrl } = useServiceContext();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(currentService.getDefaultProvider());
  const [isOfficialMode, setIsOfficialMode] = useState<boolean>(currentService.isOfficialMode());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProviderValid, setIsProviderValid] = useState<boolean | null>(null);

  const handleUpdateProvide = useCallback((value: string) => {
    if (!value) {
      NotificationStore.displayError(t('Please select a provider'));

      return;
    }

    updateProvider(value);
    setSelectedProvider(value);
    setIsProviderValid(null);
  }, [updateProvider]);

  const handleOfficialMode = useCallback((value: boolean) => {
    updateOfficialMode(value);
    setIsOfficialMode(value);
    setIsProviderValid(null);
  }, [updateOfficialMode]);

  const validateProvider = useCallback(async () => {
    setIsLoading(true);

    try {;
      logout(true);

      await validateUrl(currentService.getProvider());

      setIsProviderValid(true);
    } catch (error) {
      console.error(error);
      NotificationStore.displayError(t('Invalid provider'));

      setIsProviderValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentService, logout, validateUrl]);

  const handleNext = useCallback(() => {
    logout(true);
  }, [logout]);

  return (
    <BaseSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      onNext={ handleNext }
      styles={ styles }
    >
      <View style={ styles.providerWrapper }>
        <ThemedCustomSelect
          options={ currentService.defaultProviders }
          value={ selectedProvider ?? '' }
          onSelect={ handleUpdateProvide }
          disabled={ isOfficialMode }
        />
        <View style={ styles.providerOffModeRow }>
          <ThemedText>
            { t('Official mode') }
          </ThemedText>
          <ThemedToggle
            value={ isOfficialMode }
            onValueChange={ handleOfficialMode }
          />
        </View>
        <ThemedPressable
          style={ styles.providerValidateButton }
          contentStyle={ [
            styles.providerValidateButtonContent,
            isLoading && styles.providerValidateButtonDisabled,
          ] }
          onPress={ validateProvider }
          disabled={ isLoading }
          withAnimation
        >
          { ({ isFocused }) => (
            <View style={ [
              styles.providerValidateButtonInner,
              isFocused && styles.TVfocused,
            ] }
            >
              { isProviderValid === null && (
                <RefreshCw color={ isFocused ? theme.colors.iconFocused : theme.colors.icon } />
              ) }
              { isProviderValid === false && (
                <CircleAlert color='red' />
              ) }
              { isProviderValid === true && (
                <Check color='green' />
              ) }
              <ThemedText
                style={ [
                  styles.providerButtonText,
                  isFocused && styles.TVfocusedText,
                ] }
              >
                { t('Validate') }
              </ThemedText>
            </View>
          ) }
        </ThemedPressable>
      </View>
    </BaseSlide>
  );
};

type LoginSlideProps = SlideProps & {
};

export const LoginSlide = ({
  slide,
  goBack,
  goNext,
  styles,
}: LoginSlideProps) => {
  const { theme, scale } = useAppTheme();
  const { isTV } = useConfigContext();
  const { profile, currentService, login } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const usernameRef = useRef<string | null>(null);
  const passwordRef = useRef<string | null>(null);
  const registrationOverlayRef = useRef<ThemedOverlayRef>(null);

  const handleNext = useCallback((s: SlideInterface) => {
    // if (!isSignedIn) {
    //   NotificationStore.displayMessage(t('Please sign in to continue'));

    //   return;
    // }

    goNext(s);
  }, [goNext]);

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
        withAnimation
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
        <ThemedPressable onPress={ handleRegistration } withAnimation>
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
                withAnimation
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
              <DefaultFocus>
                <ThemedButton
                  style={ styles.registrationConfirmButton }
                  onPress={ () => registrationOverlayRef.current?.close() }
                >
                  { t('Authorize') }
                </ThemedButton>
              </DefaultFocus>
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
      slide={ slide }
      goBack={ goBack }
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

type CDNSlideProps = SlideProps & {
};

export const CDNSlide = ({
  slide,
  goBack,
  goNext,
  styles,
}: CDNSlideProps) => {
  const { theme } = useAppTheme();
  const { currentService, validateUrl, updateAutomaticCDN, updateCDN } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCDN, setSelectedCDN] = useState<string | null>(currentService.getCDN());
  const [isAutomatic, setIsAutomatic] = useState<boolean>(currentService.isAutomaticCDN());
  const [isCDNValid, setIsCDNValid] = useState<boolean | null>(null);

  const handleUpdateCDN = useCallback(() => {
    if (!selectedCDN) {
      NotificationStore.displayError(t('Please select a CDN'));

      return;
    }

    setSelectedCDN(selectedCDN);
    updateCDN(selectedCDN ?? '');
    setIsCDNValid(null);
  }, [selectedCDN, updateCDN]);

  const handleAutomaticMode = useCallback((value: boolean) => {
    setIsAutomatic(value);
    updateAutomaticCDN(value);
    setIsCDNValid(null);
  }, [updateAutomaticCDN]);

  const handleValidateCDN = useCallback(async () => {
    let film: FilmInterface | null = null;

    setIsLoading(true);

    try {
      film = await currentService.getFilm(TEST_URL);
    } catch (error) {
      console.error(error);
      NotificationStore.displayError(t('Invalid CDN'));

      return;
    }

    if (!film) {
      return;
    }

    const { voices } = film;

    if (!voices.length
      || !voices[0].video
      || !voices[0].video.streams.length
    ) {
      setIsLoading(false);
      NotificationStore.displayError(t('Something went wrong'));

      return;
    }

    const { url } = currentService.modifyCDN(voices[0].video.streams)[0];

    try {
      await validateUrl((new URL(url)).origin);

      setIsCDNValid(true);
    } catch (error) {
      NotificationStore.displayError(error as Error);

      setIsCDNValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentService, validateUrl]);

  return (
    <BaseSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      style={ styles.cdnSlide }
      onNext={ handleUpdateCDN }
      styles={ styles }
    >
      <View style={ styles.cdnWrapper }>
        <ThemedCustomSelect
          options={ currentService.defaultCDNs }
          value={ selectedCDN ?? '' }
          onSelect={ handleUpdateCDN }
          disabled={ isAutomatic }
        />
        <View style={ styles.providerOffModeRow }>
          <ThemedText>
            { t('Automatic') }
          </ThemedText>
          <ThemedToggle
            value={ isAutomatic }
            onValueChange={ handleAutomaticMode }
          />
        </View>

        <ThemedPressable
          style={ styles.providerValidateButton }
          contentStyle={ [
            styles.providerValidateButtonContent,
            isLoading && styles.providerValidateButtonDisabled,
          ] }
          onPress={ handleValidateCDN }
          disabled={ isLoading }
          withAnimation
        >
          { ({ isFocused }) => (
            <View style={ [
              styles.providerValidateButtonInner,
              isFocused && styles.TVfocused,
            ] }
            >
              { isCDNValid === null && (
                <RefreshCw color={ isFocused ? theme.colors.iconFocused : theme.colors.icon } />
              ) }
              { isCDNValid === false && (
                <CircleAlert color='red' />
              ) }
              { isCDNValid === true && (
                <Check color='green' />
              ) }
              <ThemedText
                style={ [
                  styles.providerButtonText,
                  isFocused && styles.TVfocusedText,
                ] }
              >
                { t('Validate') }
              </ThemedText>
            </View>
          ) }
        </ThemedPressable>
      </View>
    </BaseSlide>
  );
};

export const SlidePressable = ({
  style,
  contentStyle,
  children,
  styles,
  spatialRef,
  spatialStyle,
  onPress,
}: {
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode | ((props: ThemedFocusableNodeState) => React.ReactElement);
  styles: ThemedStyles<typeof componentStyles>;
  spatialRef?: React.Ref<SpatialNavigationNodeRef>;
  spatialStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) => {
  const { theme } = useAppTheme();

  return (
    <SpatialNavigationFocusableView
      ref={ spatialRef }
      onSelect={ onPress }
      style={ [spatialStyle] }
    >
      { ({ isFocused, isRootActive }) => (
        <View style={ [style, { overflow: 'hidden' }] }>
          <Pressable
            onPress={ onPress }
            android_ripple={ {
              color: theme.colors.pressableHighlight,
              foreground: true,
            } }
            unstable_pressDelay={ 0 }
            style={ [{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }, contentStyle, isFocused && styles.TVfocused] }
            tvFocusable={ false }
            focusable={ false }
          >
            { typeof children === 'function' ? children({ isFocused, isRootActive }) : children }
          </Pressable>
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );
};