import KeyboardAdjuster from 'Component/KeyboardAdjuster';
import ThemedDropdown from 'Component/ThemedDropdown';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedInput from 'Component/ThemedInput';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { Portal } from 'Component/ThemedPortal';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { useServiceContext } from 'Context/ServiceContext';
import { useLandscape } from 'Hooks/useLandscape';
import t from 'i18n/t';
import { Check, ChevronLeft, CircleAlert } from 'lucide-react-native';
import {
  useCallback,
  useRef,
  useState,
} from 'react';
import {
  Image,
  ImageSourcePropType,
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
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import { Colors } from 'Style/Colors';
import { FilmInterface } from 'Type/Film.interface';
import { scale } from 'Util/CreateStyles';
import { SpatialNavigationKeyboardLocker } from 'Util/RemoteControl/SpatialNavigationKeyboardLocker';

import { TEST_URL } from './WelcomePage.config';
import { styles } from './WelcomePage.style';
import { DeviceType, SlideInterface } from './WelcomePage.type';
import { WelcomePageMobile, WelcomePageTV } from './WelcomePageIcons';

export type SlideProps = {
  slide: SlideInterface;
  goBack: (slide: SlideInterface) => void;
  goNext: (slide: SlideInterface) => void;
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
}: BaseSlideProps) => {
  const isLandscape = useLandscape();
  const nextButtonRef = useRef<SpatialNavigationNodeRef>(null);

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
              color={ Colors.white }
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
            <SpatialNavigationFocusableView
              onSelect={ handleBack }
            >
              { ({ isFocused }) => (
                <ThemedPressable
                  style={ styles.prevButton }
                  contentStyle={ [
                    styles.prevButtonContent,
                    isFocused && styles.TVfocused,
                  ] }
                  onPress={ handleBack }
                  pressDelay={ 0 }
                  resolveAsMobile
                >
                  <ChevronLeft
                    size={ scale(24) }
                    color={ isFocused ? Colors.black : Colors.white }
                  />
                </ThemedPressable>
              ) }
            </SpatialNavigationFocusableView>
          </View>
        ) }
        <DefaultFocus>
          { (canNext || canComplete) && (
            <SpatialNavigationFocusableView
              ref={ nextButtonRef }
              onSelect={ canComplete ? complete : handleNext }
              style={ [
                styles.nextButton,
                isLandscape && styles.nextButtonLandscape,
              ] }
            >
              { ({ isFocused }) => (
                <ThemedPressable
                  style={ styles.nextButtonPressable }
                  contentStyle={ [
                    styles.nextButtonContent,
                    isFocused && styles.TVfocused,
                  ] }
                  onPress={ canComplete ? complete : handleNext }
                  pressDelay={ 0 }
                  mode='dark'
                  resolveAsMobile
                >
                  <ThemedText
                    style={ [
                      styles.buttonText,
                      isFocused && styles.TVfocusedText,
                    ] }
                  >
                    { canComplete ? t('Complete') : t('Next') }
                  </ThemedText>
                </ThemedPressable>
              ) }
            </SpatialNavigationFocusableView>
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
          <KeyboardAdjuster />
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
}: ConfigureSlideProps) => {
  const handleNext = useCallback((s: SlideInterface) => {
    if (!selectedDeviceType) {
      NotificationStore.displayMessage(t('Please select a device type'));

      return;
    }

    goNext(s);
  }, [selectedDeviceType]);

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
    >
      <View style={ styles.configureWrapper }>
        <SpatialNavigationFocusableView
          onSelect={ handleSelectTV }
          style={ styles.configureButton }
        >
          { ({ isFocused }) => (
            <ThemedPressable
              style={ styles.configureButtonPressable }
              contentStyle={ [
                styles.configureButtonContent,
                selectedDeviceType === DeviceType.TV && styles.configureButtonSelected,
                isFocused && styles.TVfocused,
              ] }
              onPress={ handleSelectTV }
              resolveAsMobile
            >
              <View style={ styles.configureContainer }>
                <View style={ styles.configureIcon }>
                  <WelcomePageTV
                    color={ isFocused ? Colors.black : Colors.white }
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
            </ThemedPressable>
          ) }
        </SpatialNavigationFocusableView>
        <SpatialNavigationFocusableView
          onSelect={ handleSelectMobile }
          style={ styles.configureButton }
        >
          { ({ isFocused }) => (
            <ThemedPressable
              style={ styles.configureButtonPressable }
              contentStyle={ [
                styles.configureButtonContent,
                selectedDeviceType === DeviceType.MOBILE && styles.configureButtonSelected,
                isFocused && styles.TVfocused,
              ] }
              onPress={ handleSelectMobile }
              resolveAsMobile
            >
              <View style={ styles.configureContainer }>
                <View style={ styles.configureIcon }>
                  <WelcomePageMobile
                    color={ isFocused ? Colors.black : Colors.white }
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
            </ThemedPressable>
          ) }
        </SpatialNavigationFocusableView>
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
}: ProviderSlideProps) => {
  const { currentService, updateProvider, updateOfficialMode } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(currentService.getDefaultProvider());
  const [isProviderValid, setIsProviderValid] = useState<boolean | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>(currentService.getOfficialMode()); // actually it is a provider link
  const overlayRef = useRef<ThemedOverlayRef>(null);

  const validateProvider = useCallback(async () => {
    setIsLoading(true);

    try {
      updateOfficialMode(selectedMode);

      // with official mode, we don't need to set provider, because official mode will use separate provider
      await updateProvider(selectedMode ? '' : (selectedProvider ?? ''), true);
      await currentService.getFilm(TEST_URL);

      setIsProviderValid(true);
    } catch (error) {
      LoggerStore.error('validateProvider', { error });

      NotificationStore.displayError(t('Invalid provider'));

      setIsProviderValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvider, selectedMode, currentService, updateProvider, updateOfficialMode]);

  const handleUpdateProvider = useCallback(() => {
    updateOfficialMode(selectedMode);
    updateProvider(selectedMode ? '' : (selectedProvider ?? ''), true);
  }, [selectedProvider, selectedMode, updateProvider, updateOfficialMode]);

  const handleSelectMode = useCallback(({ value }: DropdownItem) => {
    setSelectedMode(value);
    overlayRef.current?.close();
  }, []);

  return (
    <BaseSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      onNext={ handleUpdateProvider }
    >
      <View style={ styles.providerWrapper }>
        <ThemedInput
          style={ [
            styles.providerSelectorInput,
            isLoading && styles.providerValidateButtonDisabled,
            selectedMode && styles.providerValidateButtonDisabled,
          ] }
          placeholder={ t('Provider') }
          onChangeText={ setSelectedProvider }
          value={ selectedProvider ?? '' }
          editable={ !selectedMode }
        />
        <ThemedText>
          { t('Official mode') }
        </ThemedText>
        <ThemedDropdown
          overlayRef={ overlayRef }
          data={ currentService.officialMirrors }
          onChange={ handleSelectMode }
          header={ t('Official mode') }
          value={ selectedMode ?? '' }
        />
        <SpatialNavigationFocusableView
          onSelect={ validateProvider }
          style={ styles.providerButtonContainer }
        >
          { ({ isFocused }) => (
            <ThemedPressable
              style={ styles.providerValidateButton }
              contentStyle={ [
                styles.providerValidateButtonContent,
                isFocused && styles.TVfocused,
                isLoading && styles.providerValidateButtonDisabled,
              ] }
              onPress={ validateProvider }
              disabled={ isLoading }
              resolveAsMobile
            >
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
            </ThemedPressable>
          ) }
        </SpatialNavigationFocusableView>
      </View>
    </BaseSlide>
  );
};

type CDNSlideProps = SlideProps & {
};

export const CDNSlide = ({
  slide,
  goBack,
  goNext,
}: CDNSlideProps) => {
  const { currentService, validateUrl, updateCDN, getCDNs } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCDN, setSelectedCDN] = useState<string | null>(currentService.getCDN());
  const [isCDNValid, setIsCDNValid] = useState<boolean | null>(null);
  const overlayRef = useRef<ThemedOverlayRef>(null);

  const handleValidateCDN = useCallback(async () => {
    let film: FilmInterface | null = null;

    setIsLoading(true);

    try {
      updateCDN(selectedCDN ?? '', true);
      film = await currentService.getFilm(TEST_URL);
    } catch (error) {
      LoggerStore.error('handleValidateCDN', { error });

      NotificationStore.displayError(t('Invalid Provider'));

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
      LoggerStore.error('handleLogin', { error });

      NotificationStore.displayError(error as Error);

      setIsCDNValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCDN]);

  const handleUpdateCDN = useCallback(() => {
    updateCDN(selectedCDN ?? '', true);
  }, [selectedCDN, updateCDN]);

  const handleSelect = useCallback(({ value }: DropdownItem) => {
    updateCDN(value);
    setSelectedCDN(value);
    overlayRef.current?.close();
  }, [updateCDN]);

  return (
    <BaseSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      style={ styles.cdnSlide }
      onNext={ handleUpdateCDN }
    >
      <View style={ styles.cdnWrapper }>
        <ThemedDropdown
          overlayRef={ overlayRef }
          data={ getCDNs() }
          onChange={ handleSelect }
          header={ t('CDN') }
          value={ selectedCDN ?? '' }
        />
        <SpatialNavigationFocusableView
          onSelect={ handleValidateCDN }
          style={ styles.providerButtonContainer }
        >
          { ({ isFocused }) => (
            <ThemedPressable
              style={ styles.providerValidateButton }
              contentStyle={ [
                styles.providerValidateButtonContent,
                isFocused && styles.TVfocused,
                isLoading && styles.providerValidateButtonDisabled,
              ] }
              onPress={ handleValidateCDN }
              disabled={ isLoading }
              resolveAsMobile
            >
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
            </ThemedPressable>
          ) }
        </SpatialNavigationFocusableView>
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
}: LoginSlideProps) => {
  const { profile, login } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback(async () => {
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (error) {
      NotificationStore.displayError(error as Error);

      LoggerStore.error('handleLogin', { error });
    } finally {
      setIsLoading(false);
    }
  }, [login, username, password]);

  const renderLoginForm = () => (
    <View>
      <View style={ styles.loginForm }>
        <ThemedInput
          style={ isLoading && styles.providerValidateButtonDisabled }
          placeholder={ t('Login or email') }
          onChangeText={ setUsername }
          defaultValue={ username ?? '' }
        />
        <ThemedInput
          style={ isLoading && styles.providerValidateButtonDisabled }
          placeholder={ t('Password') }
          onChangeText={ setPassword }
          defaultValue={ password ?? '' }
          secureTextEntry
        />
      </View>
      <View style={ styles.providerButtonContainer }>
        <SpatialNavigationFocusableView
          onSelect={ handleLogin }
          style={ styles.providerButtonContainer }
        >
          { ({ isFocused }) => (
            <ThemedPressable
              style={ styles.providerValidateButton }
              contentStyle={ [
                styles.providerValidateButtonContent,
                isFocused && styles.TVfocused,
                isLoading && styles.providerValidateButtonDisabled,
              ] }
              onPress={ handleLogin }
              resolveAsMobile
            >
              <ThemedText
                style={ [
                  styles.providerButtonText,
                  isFocused && styles.TVfocusedText,
                ] }
              >
                { t('Sign in') }
              </ThemedText>
            </ThemedPressable>
          ) }
        </SpatialNavigationFocusableView>
      </View>
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
      goNext={ goNext }
      style={ styles.loginSlide }
      customImage={ profile?.avatar }
      customTitle={ profile ? t('Welcome back, %s!', profile.name) : undefined }
      customSubtitle={ profile?.email }
    >
      { renderContent() }
    </BaseSlide>
  );
};
