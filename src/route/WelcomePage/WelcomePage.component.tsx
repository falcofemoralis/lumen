import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import React, {
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Pressable,
  ScaledSize,
  StyleProp,
  TextInput,
  TVFocusGuideView,
  View,
  ViewStyle,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import SliderIntro, { SliderRef } from '../../libs/react-native-slider-intro/src';
import { styles } from './WelcomePage.style';
import {
  SlideInterface,
  SlideType,
  WelcomePageComponentProps,
} from './WelcomePage.type';
import { WelcomePageMobile, WelcomePageTV } from './WelcomePageIcons';

const { width } = Dimensions.get('window');
const deviceMaxHeight = Dimensions.get('screen').height;

type WelcomeSlideRef = {
  focus: () => void;
}

interface WelcomeSlideProps {
  slide: SlideInterface;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  canNext?: boolean;
  canBack?: boolean;
  canComplete?: boolean;
  customImage?: string;
  customTitle?: string;
  customSubtitle?: string;
  complete?: () => void;
  goBack?: (slide: SlideInterface) => void;
  goNext?: (slide: SlideInterface) => void;
}
export const WelcomeSlide = forwardRef<WelcomeSlideRef, WelcomeSlideProps>(
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
      complete,
      goBack,
      goNext,
    },
    ref,
  ) => {
    const [isLandscape, setIsLandscape] = useState(false);
    const completeButtonRef = useRef<View>(null);
    const nextButtonRef = useRef<View>(null);

    const updateOrientation = (args?: { window: ScaledSize }) => {
      const { window } = args ?? {};
      const { width: w, height: h } = window ?? Dimensions.get('window');
      const newLandscape = w > h;

      setIsLandscape(newLandscape);
    };

    useEffect(() => {
      const dimensionChangeHandler = Dimensions.addEventListener('change', updateOrientation);

      updateOrientation();

      return () => {
        dimensionChangeHandler.remove();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (canComplete) {
          completeButtonRef.current?.requestTVFocus();

          return;
        }

        nextButtonRef.current?.requestTVFocus();
      },
    }));

    const renderBaseSlide = () => {
      const {
        icon,
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
          <View style={ styles.iconContainer }>
            { customImage ? (
              <ThemedImage
                src={ customImage }
                style={ [
                  styles.icon,
                  styles.customImage,
                ] }
              />
            ) : (
              <ThemedIcon
                style={ styles.icon }
                icon={ icon }
                size={ scale(32) }
                color="white"
              />
            ) }
          </View>
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
        { canNext && (
          <View style={ styles.buttonContainer }>
            <Pressable
              ref={ nextButtonRef }
              style={ ({ focused }) => ([
                styles.nextButton,
                focused && styles.TVfocused,
              ]) }
              onPress={ () => goNext?.(slide) }
            >
              <ThemedText style={ styles.buttonText }>
                { t('Next') }
              </ThemedText>
              <ThemedIcon
                icon={ {
                  name: 'navigate-next',
                  pack: IconPackType.MaterialIcons,
                } }
                size={ scale(24) }
                color="white"
              />
            </Pressable>
          </View>
        ) }
        { canComplete && (
          <View style={ styles.buttonContainer }>
            <Pressable
              ref={ completeButtonRef }
              style={ ({ focused }) => ([
                styles.nextButton,
                styles.finishButton,
                focused && styles.TVfocused,
              ]) }
              onPress={ complete }
            >
              <ThemedText style={ styles.buttonText }>
                { t('Complete') }
              </ThemedText>
              <ThemedIcon
                icon={ {
                  name: 'done',
                  pack: IconPackType.MaterialIcons,
                } }
                size={ scale(20) }
                color="white"
              />
            </Pressable>
          </View>
        ) }
        { canBack && (
          <View style={ styles.buttonContainer }>
            <Pressable
              style={ ({ focused }) => ([
                styles.prevButton,
                focused && styles.TVfocused,
              ]) }
              onPress={ () => goBack?.(slide) }
            >
              <ThemedIcon
                icon={ {
                  name: 'navigate-before',
                  pack: IconPackType.MaterialIcons,
                } }
                size={ scale(24) }
                color="white"
              />
              <ThemedText style={ styles.buttonText }>
                { t('Back') }
              </ThemedText>
            </Pressable>
          </View>
        ) }
      </View>
    );

    return (
      <TVFocusGuideView
        trapFocusRight
        trapFocusLeft
        autoFocus
      >
        <View style={ styles.container }>
          <View style={ style }>
            { renderBaseSlide() }
            { children }
            { renderBaseNavigation() }
          </View>
        </View>
      </TVFocusGuideView>
    );
  },
);

export function WelcomePageComponent({
  slides,
  selectedDeviceType,
  isLoading,
  isProviderValid,
  isCDNValid,
  selectedProvider,
  selectedCDN,
  profile,
  handleSelectTV,
  handleSelectMobile,
  validateProvider,
  validateCDN,
  complete,
  setSelectedProvider,
  setSelectedCDN,
  login,
}: WelcomePageComponentProps) {
  const introSliderRef = useRef<SliderRef>(null);
  const slidesRefs = useRef<{[key: string]: React.RefObject<WelcomeSlideRef>}>({});
  const isTV = selectedDeviceType === 'TV';

  slides.forEach((slide) => {
    slidesRefs.current[slide.id] = createRef();
  });

  useEffect(() => {
    slidesRefs.current[slides[0].id].current?.focus();
  },
  []);

  const goBack = (slide: SlideInterface) => {
    const currentSlideIdx = slides.findIndex((s) => s.id === slide.id);
    const prevSlide = (currentSlideIdx - 1) >= 0 ? slides[currentSlideIdx - 1] : slides[0];
    slidesRefs.current[prevSlide.id].current?.focus();
    introSliderRef.current?.goBack();
  };

  const goNext = (slide: SlideInterface) => {
    const currentSlideIdx = slides.findIndex((s) => s.id === slide.id);
    const nextSlide = (currentSlideIdx + 1) <= (slides.length - 1)
      ? slides[currentSlideIdx + 1]
      : slides[(slides.length - 1)];
    slidesRefs.current[nextSlide.id].current?.focus();
    introSliderRef.current?.goNext();
  };

  const renderWelcomeSlide = (slide: SlideInterface) => (
    <WelcomeSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      style={ styles.welcomeSlide }
      canBack={ false }
    />
  );

  const renderConfigureSlide = (slide: SlideInterface) => {
    const handleNext = (s: SlideInterface) => {
      if (!selectedDeviceType) {
        NotificationStore.displayMessage(t('Please select a device type'));

        return;
      }

      goNext(s);
    };

    return (
      <WelcomeSlide
        ref={ slidesRefs.current[slide.id] }
        slide={ slide }
        goBack={ goBack }
        goNext={ handleNext }
        style={ styles.configureSlide }
      >
        <View style={ styles.configureWrapper }>
          <Pressable
            style={ ({ focused }) => ([
              styles.configureButton,
              selectedDeviceType === 'TV' && styles.configureSelected,
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
          </Pressable>
          <Pressable
            style={ ({ focused }) => ([
              styles.configureButton,
              selectedDeviceType === 'MOBILE' && styles.configureSelected,
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
          </Pressable>
        </View>
      </WelcomeSlide>
    );
  };

  const renderProviderSlide = (slide: SlideInterface) => {
    const inputRef = useRef<TextInput>(null);

    const handleInputPress = () => {
      inputRef.current?.focus();
    };

    return (
      <WelcomeSlide
        ref={ slidesRefs.current[slide.id] }
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
        style={ styles.providerSlide }
      >
        <View style={ styles.providerWrapper }>
          { isTV ? (
            <Pressable
              style={ ({ focused }) => ([
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
                cursorColor={ Colors.secondary }
                selectionColor={ Colors.secondary }
                placeholderTextColor={ Colors.white }
              />
            </Pressable>
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
              cursorColor={ Colors.secondary }
              selectionColor={ Colors.secondary }
              placeholderTextColor={ Colors.white }
            />
          ) }
          <View style={ styles.providerButtonContainer }>
            <Pressable
              style={ ({ focused }) => ([
                styles.providerValidateButton,
                focused && styles.TVfocused,
                isLoading && styles.providerValidateButtonDisabled,
              ]) }
              onPress={ validateProvider }
            >
              { isProviderValid !== null && (
                <ThemedIcon
                  icon={ {
                    name: isProviderValid === true ? 'check-circle' : 'close-circle',
                    pack: IconPackType.MaterialCommunityIcons,
                  } }
                  size={ scale(24) }
                  color={ isProviderValid === true ? 'green' : 'red' }
                />
              ) }
              <ThemedText style={ styles.providerButtonText }>
                { t('Validate') }
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </WelcomeSlide>
    );
  };

  const renderCDNSlide = (slide: SlideInterface) => {
    const inputRef = useRef<View>(null);
    const [isOpened, setIsOpened] = useState(false);
    const options = [
      {
        value: 'auto',
        label: t('Automatic'),
      },
    ].concat(ServiceStore.getCurrentService().defaultCDNs.map((cdn) => ({
      value: cdn,
      label: cdn,
    })));

    const handleSelectorPress = () => {
      setIsOpened(!isOpened);
    };

    const handleItemPress = (value: string) => {
      setSelectedCDN(value);
      setIsOpened(false);
      inputRef.current?.requestTVFocus();
    };

    return (
      <WelcomeSlide
        ref={ slidesRefs.current[slide.id] }
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
        style={ styles.cdnSlide }
      >
        <View style={ styles.cdnWrapper }>
          <Pressable
            ref={ inputRef }
            style={ ({ focused }) => ([
              styles.cdnSelector,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ handleSelectorPress }
          >
            <ThemedText>
              { options.find((option) => option.value === selectedCDN)?.label ?? '' }
            </ThemedText>
          </Pressable>
          { isOpened && (
            <ScrollView style={ styles.cdnSelectorListScroll }>
              <View style={ styles.cdnSelectorList }>
                { options.map((option) => (
                  <Pressable
                    key={ option.value }
                    style={ ({ focused }) => ([
                      styles.cdnSelectorListItem,
                      focused && styles.TVfocused,
                    ]) }
                    onPress={ () => handleItemPress(option.value) }
                  >
                    <ThemedText style={ styles.cdnSelectorListItemText }>
                      { option.label }
                    </ThemedText>
                  </Pressable>
                )) }
              </View>
            </ScrollView>
          ) }
          <View style={ styles.providerButtonContainer }>
            <Pressable
              style={ ({ focused }) => ([
                styles.providerValidateButton,
                focused && styles.TVfocused,
                isLoading && styles.providerValidateButtonDisabled,
              ]) }
              onPress={ validateCDN }
            >
              { isCDNValid !== null && (
                <ThemedIcon
                  icon={ {
                    name: isCDNValid === true ? 'check-circle' : 'close-circle',
                    pack: IconPackType.MaterialCommunityIcons,
                  } }
                  size={ scale(24) }
                  color={ isCDNValid === true ? 'green' : 'red' }
                />
              ) }
              <ThemedText style={ styles.providerButtonText }>
                { t('Validate') }
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </WelcomeSlide>
    );
  };

  const renderLoginSlide = (slide: SlideInterface) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const usernameRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    const handleUsernamePress = () => {
      usernameRef.current?.focus();
    };

    const handlePasswordPress = () => {
      passwordRef.current?.focus();
    };

    const renderLoginForm = () => (
      <View>
        <View style={ styles.loginForm }>
          { isTV ? (
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
          { isTV ? (
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
          <Pressable
            style={ ({ focused }) => ([
              styles.providerValidateButton,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ () => login(username, password) }
          >
            <ThemedText style={ styles.providerButtonText }>
              { t('Sign in') }
            </ThemedText>
          </Pressable>
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
      <WelcomeSlide
        ref={ slidesRefs.current[slide.id] }
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
        style={ styles.loginSlide }
        customImage={ profile?.avatar }
        customTitle={ profile ? t('Welcome back, %s!', profile.name) : undefined }
        customSubtitle={ profile?.email }
      >
        { renderContent() }
      </WelcomeSlide>
    );
  };

  const renderCompleteSlide = (slide: SlideInterface) => (
    <WelcomeSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      style={ styles.completeSlide }
      canNext={ false }
      canComplete
      complete={ complete }
    />
  );

  const renderSlide = (slide: SlideInterface): Record<SlideType, React.ReactNode> => ({
    WELCOME: renderWelcomeSlide(slide),
    CONFIGURE: renderConfigureSlide(slide),
    PROVIDER: renderProviderSlide(slide),
    CDN: renderCDNSlide(slide),
    LOGIN: renderLoginSlide(slide),
    COMPLETE: renderCompleteSlide(slide),
  });

  const renderSlides = () => slides.map((slide) => (
    <View
      key={ slide.id }
      style={ { width } }
    >
      <View
        style={ [
          styles.container,
          {
            height: deviceMaxHeight,
            maxHeight: deviceMaxHeight,
          },
        ] }
      >
        { renderSlide(slide)[slide.id] }
      </View>
    </View>
  ));

  return (
    <SliderIntro
      ref={ introSliderRef }
      navContainerMaxSizePercent={ 0.25 }
      numberOfSlides={ slides.length }
      dotWidth={ 15 }
      showLeftButton={ false }
    >
      { renderSlides() }
    </SliderIntro>
  );
}

export default WelcomePageComponent;
