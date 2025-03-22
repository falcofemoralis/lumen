import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import React, {
  createRef, forwardRef, useEffect, useImperativeHandle, useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Pressable,
  ScaledSize,
  StyleProp,
  TVFocusGuideView,
  View,
  ViewStyle,
} from 'react-native';
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
            <ThemedIcon
              style={ styles.icon }
              icon={ icon }
              size={ scale(32) }
              color="white"
            />
          </View>
          <ThemedText style={ styles.title }>
            { title }
          </ThemedText>
          <ThemedText style={ styles.subtitle }>
            { subtitle }
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
            </Pressable>
          </View>
        ) }
        { canComplete && (
          <View style={ styles.buttonContainer }>
            <Pressable
              ref={ completeButtonRef }
              style={ ({ focused }) => ([
                styles.nextButton,
                focused && styles.TVfocused,
              ]) }
              onPress={ complete }
            >
              <ThemedText style={ styles.buttonText }>
                { t('Complete') }
              </ThemedText>
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
  handleSelectTV,
  handleSelectMobile,
  validateProvider,
  validateCDN,
  complete,
}: WelcomePageComponentProps) {
  const introSliderRef = useRef<SliderRef>(null);
  const slidesRefs = useRef<{[key: string]: React.RefObject<WelcomeSlideRef>}>({});

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

  const renderConfigureSlide = (slide: SlideInterface) => (
    <WelcomeSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
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

  const renderProviderSlide = (slide: SlideInterface) => (
    <WelcomeSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      style={ styles.providerSlide }
    >
      <View style={ styles.providerWrapper }>
        <ThemedText style={ styles.providerSelector }>
          { selectedProvider ?? '' }
        </ThemedText>
        <View style={ styles.providerButtonContainer }>
          <Pressable
            style={ ({ focused }) => ([
              styles.providerValidateButton,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ validateProvider }
            disabled={ isLoading }
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

  const renderCDNSlide = (slide: SlideInterface) => (
    <WelcomeSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      style={ styles.cdnSlide }
    >
      <View style={ styles.providerWrapper }>
        <ThemedText style={ styles.cdnSelector }>
          { selectedCDN ?? '' }
        </ThemedText>
        <View style={ styles.providerButtonContainer }>
          <Pressable
            style={ ({ focused }) => ([
              styles.providerValidateButton,
              focused && styles.TVfocused,
              isLoading && styles.providerValidateButtonDisabled,
            ]) }
            onPress={ validateCDN }
            disabled={ isLoading }
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
