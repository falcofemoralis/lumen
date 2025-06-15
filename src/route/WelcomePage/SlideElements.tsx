import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { useServiceContext } from 'Context/ServiceContext';
import t from 'i18n/t';
import { Check, ChevronLeft, CircleAlert } from 'lucide-react-native';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleProp,
  TextInput,
  TVFocusGuideView,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { AvoidSoftInputView } from 'react-native-avoid-softinput';
import NotificationStore from 'Store/Notification.store';
import { Colors } from 'Style/Colors';
import { FilmInterface } from 'Type/Film.interface';
import { scale } from 'Util/CreateStyles';

import { TEST_URL } from './WelcomePage.config';
import { styles } from './WelcomePage.style';
import { DeviceType, SlideInterface } from './WelcomePage.type';
import { WelcomePageMobile, WelcomePageTV } from './WelcomePageIcons';

export type SlideProps = {
  ref: React.RefObject<BaseSlideRef | null>;
  slide: SlideInterface;
  selectedDeviceType: DeviceType | null;
  goBack: (slide: SlideInterface) => void;
  goNext: (slide: SlideInterface) => void;
}

export type BaseSlideRef = {
  focus: () => void;
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

export const BaseSlide = forwardRef<BaseSlideRef, BaseSlideProps>(
  (
    {
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
    },
    ref
  ) => {
    const { width, height } = useWindowDimensions();
    const [isLandscape, setIsLandscape] = useState(false);
    const nextButtonRef = useRef<View>(null);

    useEffect(() => {
      const newLandscape = width > height;

      if (newLandscape !== isLandscape) {
        setIsLandscape(newLandscape);
      }
    }, [width, height]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        nextButtonRef.current?.requestTVFocus();
      },
    }));

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

    const renderBaseNavigation = () => (
      <View style={ styles.navigation }>
        { canBack && (
          <View style={ styles.prevButtonContainer }>
            <ThemedPressable
              style={ styles.prevButton }
              stateStyle={ ({ focused }) => ([
                styles.prevButtonContent,
                focused && styles.TVfocused,
              ]) }
              onPress={ () => goBack?.(slide) }
            >
              <ChevronLeft
                size={ scale(24) }
                color="white"
              />
            </ThemedPressable>
          </View>
        ) }
        { (canNext || canComplete) && (
          <ThemedPressable
            ref={ nextButtonRef }
            style={ [
              styles.nextButton,
              isLandscape && styles.nextButtonLandscape,
            ] }
            stateStyle={ ({ focused }) => ([
              styles.nextButtonContent,
              focused && styles.TVfocused,
            ]) }
            onPress={ canComplete ? complete : () => {
              goNext?.(slide);
              onNext?.();
            } }
          >
            <ThemedText style={ styles.buttonText }>
              { canComplete ? t('Complete') : t('Next') }
            </ThemedText>
          </ThemedPressable>
        ) }
      </View>
    );

    return (
      <TVFocusGuideView
        trapFocusRight
        trapFocusLeft
      >
        <AvoidSoftInputView>
          <ScrollView
            contentContainerStyle={ [
              styles.container,
              isLandscape && styles.containerLandscape,
              style,
            ] }
          >
            { renderBaseSlide() }
            { children }
            { renderBaseNavigation() }
          </ScrollView>
        </AvoidSoftInputView>
      </TVFocusGuideView>
    );
  }
);

type ConfigureSlideProps = SlideProps & {
  configureDeviceType: (type: DeviceType) => void;
};

export const ConfigureSlide = ({
  ref,
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
      ref={ ref }
      slide={ slide }
      goBack={ goBack }
      goNext={ handleNext }
    >
      <View style={ styles.configureWrapper }>
        <ThemedPressable
          style={ styles.configureButton }
          stateStyle={ ({ focused }) => ([
            styles.configureButtonContent,
            selectedDeviceType === DeviceType.TV && styles.configureButtonSelected,
            focused && styles.TVfocused,
          ]) }
          onPress={ handleSelectTV }
        >
          <View style={ styles.configureContainer }>
            <View style={ styles.configureIcon }>
              <WelcomePageTV />
            </View>
            <View style={ styles.configureInfo }>
              <ThemedText style={ styles.configureTitle }>
                { t('TV Version') }
              </ThemedText>
              <ThemedText style={ styles.configureSubtitle }>
                { t('Suits for TV') }
              </ThemedText>
            </View>
          </View>
        </ThemedPressable>
        <ThemedPressable
          style={ styles.configureButton }
          stateStyle={ ({ focused }) => ([
            styles.configureButtonContent,
            selectedDeviceType === DeviceType.MOBILE && styles.configureButtonSelected,
            focused && styles.TVfocused,
          ]) }
          onPress={ handleSelectMobile }
        >
          <View style={ styles.configureContainer }>
            <View style={ styles.configureIcon }>
              <WelcomePageMobile />
            </View>
            <View style={ styles.configureInfo }>
              <ThemedText style={ styles.configureTitle }>
                { t('Mobile Version') }
              </ThemedText>
              <ThemedText style={ styles.configureSubtitle }>
                { t('Suits for mobile') }
              </ThemedText>
            </View>
          </View>
        </ThemedPressable>
      </View>
    </BaseSlide>
  );
};

type ProviderSlideProps = SlideProps & {
};

export const ProviderSlide = ({
  ref,
  slide,
  selectedDeviceType,
  goBack,
  goNext,
}: ProviderSlideProps) => {
  const { getCurrentService, updateProvider } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(getCurrentService().getProvider());
  const [isProviderValid, setIsProviderValid] = useState<boolean | null>(null);
  const inputRef = useRef<TextInput>(null);

  const validateProvider = useCallback(async () => {
    setIsLoading(true);

    try {
      await getCurrentService().getFilm(TEST_URL);

      setIsProviderValid(true);
    } catch (e) {
      NotificationStore.displayError(t('Invalid provider'));
      console.error(e);
      setIsProviderValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvider]);

  const handleUpdateProvider = useCallback(async () => {
    await updateProvider(selectedProvider ?? '', true);
  }, [selectedProvider, updateProvider]);

  const handleInputPress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <BaseSlide
      ref={ ref }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      onNext={ handleUpdateProvider }
    >
      <View style={ styles.providerWrapper }>
        { selectedDeviceType === DeviceType.TV ? (
          <ThemedPressable
            style={ styles.providerSelector }
            stateStyle={ ({ focused }) => ([
              styles.providerSelector,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ handleInputPress }
          >
            <TextInput
              ref={ inputRef }
              style={ styles.providerSelectorInput }
              value={ selectedProvider ?? '' }
              onChangeText={ setSelectedProvider }
              placeholderTextColor={ Colors.text }
              selectionColor={ Colors.secondary }
              cursorColor={ Colors.secondary }
              underlineColorAndroid={ Colors.transparent }
              selectionHandleColor={ Colors.secondary }
            />
          </ThemedPressable>
        ) : (
          <TextInput
            ref={ inputRef }
            style={ [
              styles.providerSelector,
              styles.providerSelectorInput,
              isLoading && styles.providerValidateButtonDisabled,
            ] }
            value={ selectedProvider ?? '' }
            onChangeText={ setSelectedProvider }
            placeholderTextColor={ Colors.text }
            selectionColor={ Colors.secondary }
            cursorColor={ Colors.secondary }
            underlineColorAndroid={ Colors.transparent }
            selectionHandleColor={ Colors.secondary }
          />
        ) }
        <View style={ styles.providerButtonContainer }>
          <ThemedPressable
            style={ styles.providerValidateButton }
            stateStyle={ ({ focused }) => ([
              styles.providerValidateButtonContent,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ validateProvider }
            disabled={ isLoading }
          >
            { isProviderValid === false && (
              <CircleAlert color='red' />
            ) }
            { isProviderValid === true && (
              <Check color='green' />
            ) }
            <ThemedText style={ styles.providerButtonText }>
              { t('Validate') }
            </ThemedText>
          </ThemedPressable>
        </View>
      </View>
    </BaseSlide>
  );
};

type CDNSlideProps = SlideProps & {
};

export const CDNSlide = ({
  ref,
  slide,
  goBack,
  goNext,
}: CDNSlideProps) => {
  const { getCurrentService, validateUrl, updateCDN } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCDN, setSelectedCDN] = useState<string | null>(getCurrentService().getCDN());
  const [isCDNValid, setIsCDNValid] = useState<boolean | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const cdnInputRef = useRef<View>(null);

  const handleValidateCDN = useCallback(async () => {
    let film: FilmInterface | null = null;

    setIsLoading(true);

    try {
      film = await getCurrentService().getFilm(TEST_URL);
    } catch (error) {
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

    const { url } = getCurrentService().modifyCDN(voices[0].video.streams)[0];

    try {
      await validateUrl((new URL(url)).origin);

      setIsCDNValid(true);
    } catch (error) {
      NotificationStore.displayError(error as Error);
      setIsCDNValid(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCDN]);

  const handleUpdateCDN = useCallback(async () => {
    await updateCDN(selectedCDN ?? '', true);
  }, [selectedCDN, updateCDN]);

  const handleSelectorPress = useCallback(() => {
    setIsOpened(!isOpened);
  }, [isOpened]);

  const handleItemPress = useCallback((value: string) => {
    updateCDN(value);
    setSelectedCDN(value);
    setIsOpened(false);
    cdnInputRef.current?.requestTVFocus();
  }, [updateCDN]);

  const options = useMemo(() => [
    {
      value: 'auto',
      label: t('Automatic'),
    },
  ].concat(getCurrentService().defaultCDNs.map((cdn) => ({
    value: cdn,
    label: cdn,
  }))), [getCurrentService]);

  return (
    <BaseSlide
      ref={ ref }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      style={ styles.cdnSlide }
      onNext={ handleUpdateCDN }
    >
      <View style={ styles.cdnWrapper }>
        <ThemedPressable
          ref={ cdnInputRef }
          style={ styles.cdnSelector }
          stateStyle={ ({ focused }) => ([
            styles.cdnSelectorContent,
            focused && styles.TVfocused,
            isLoading && styles.providerValidateButtonDisabled,
          ]) }
          onPress={ handleSelectorPress }
        >
          <ThemedText>
            { options.find((option) => option.value === selectedCDN)?.label ?? '' }
          </ThemedText>
        </ThemedPressable>
        { isOpened && (
          <ScrollView style={ styles.cdnSelectorListScroll }>
            <View style={ styles.cdnSelectorList }>
              { options.map((option) => (
                <ThemedPressable
                  key={ option.value }
                  style={ styles.cdnSelectorListItem }
                  stateStyle={ ({ focused }) => ([
                    styles.cdnSelectorListItemContent,
                    focused && styles.TVfocused,
                  ]) }
                  onPress={ () => handleItemPress(option.value) }
                >
                  <ThemedText style={ styles.cdnSelectorListItemText }>
                    { option.label }
                  </ThemedText>
                </ThemedPressable>
              )) }
            </View>
          </ScrollView>
        ) }
        <View style={ styles.providerButtonContainer }>
          <ThemedPressable
            style={ styles.providerValidateButton }
            stateStyle={ ({ focused }) => ([
              styles.providerValidateButtonContent,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ handleValidateCDN }
          >
            { isCDNValid === false && (
              <CircleAlert color='red' />
            ) }
            { isCDNValid === true && (
              <Check color='green' />
            ) }
            <ThemedText style={ styles.providerButtonText }>
              { t('Validate') }
            </ThemedText>
          </ThemedPressable>
        </View>
      </View>
    </BaseSlide>
  );
};

type LoginSlideProps = SlideProps & {
};

export const LoginSlide = ({
  ref,
  slide,
  selectedDeviceType,
  goBack,
  goNext,
}: LoginSlideProps) => {
  const { profile, login } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const loginRef = useRef<View>(null);

  const handleUsernamePress = useCallback(() => {
    if (selectedDeviceType === DeviceType.TV) {
      usernameRef.current?.focus();
    }
  }, []);

  const handlePasswordPress = useCallback(() => {
    if (selectedDeviceType === DeviceType.TV) {
      passwordRef.current?.focus();
    }
  }, []);

  const handleLogin = useCallback(async () => {
    setIsLoading(true);

    try {
      await login(username, password);
      ref.current?.focus();
    } catch (e) {
      NotificationStore.displayError(t('Invalid credentials'));

      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [login, username, password]);

  const renderLoginForm = () => (
    <View>
      <View style={ styles.loginForm }>
        { selectedDeviceType === DeviceType.TV ? (
          <Pressable
            style={ ({ focused }) => ([
              styles.providerSelector,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ handleUsernamePress }
          >
            <TextInput
              ref={ usernameRef }
              style={ styles.providerSelectorInput }
              value={ username ?? '' }
              placeholder={ t('Login or email') }
              onChangeText={ setUsername }
              cursorColor={ Colors.secondary }
              selectionColor={ Colors.secondary }
              placeholderTextColor={ Colors.white }
              onEndEditing={ handlePasswordPress }
            />
          </Pressable>
        ) : (
          <TextInput
            ref={ usernameRef }
            style={ [
              styles.providerSelector,
              styles.providerSelectorInput,
              isLoading && styles.providerValidateButtonDisabled,
            ] }
            value={ username ?? '' }
            placeholder={ t('Login or email') }
            onChangeText={ setUsername }
            cursorColor={ Colors.secondary }
            selectionColor={ Colors.secondary }
            placeholderTextColor={ Colors.white }
          />
        ) }
        { selectedDeviceType === DeviceType.TV ? (
          <Pressable
            style={ ({ focused }) => ([
              styles.providerSelector,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ handlePasswordPress }
          >
            <TextInput
              ref={ passwordRef }
              style={ styles.providerSelectorInput }
              value={ password ?? '' }
              placeholder={ t('Password') }
              onChangeText={ setPassword }
              cursorColor={ Colors.secondary }
              selectionColor={ Colors.secondary }
              placeholderTextColor={ Colors.white }
              onEndEditing={ () => loginRef.current?.requestTVFocus() }
            />
          </Pressable>
        ) : (
          <TextInput
            ref={ passwordRef }
            style={ [
              styles.providerSelector,
              styles.providerSelectorInput,
              isLoading && styles.providerValidateButtonDisabled,
            ] }
            value={ password ?? '' }
            placeholder={ t('Password') }
            onChangeText={ setPassword }
            cursorColor={ Colors.secondary }
            selectionColor={ Colors.secondary }
            placeholderTextColor={ Colors.white }
          />
        ) }
      </View>
      <View style={ styles.providerButtonContainer }>
        <ThemedPressable
          ref={ loginRef }
          style={ styles.providerValidateButton }
          stateStyle={ ({ focused }) => ([
            styles.providerValidateButtonContent,
            focused && styles.TVfocused,
            isLoading && styles.providerValidateButtonDisabled,
          ]) }
          onPress={ handleLogin }
        >
          <ThemedText style={ styles.providerButtonText }>
            { t('Sign in') }
          </ThemedText>
        </ThemedPressable>
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
      ref={ ref }
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
