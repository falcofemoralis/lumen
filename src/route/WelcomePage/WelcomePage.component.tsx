import Wrapper from 'Component/Wrapper';
import React, {
  createRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import PagerView from 'react-native-pager-view';
import { noopFn } from 'Util/Function';

import { BaseSlide, BaseSlideRef, CDNSlide, ConfigureSlide, LoginSlide, ProviderSlide } from './SlideElements';
import { styles } from './WelcomePage.style';
import {
  SlideInterface,
  WelcomePageComponentProps,
} from './WelcomePage.type';

export const WelcomePageComponent = ({
  slides,
  selectedDeviceType,
  configureDeviceType,
  complete,
}: WelcomePageComponentProps) => {
  const pagerViewRef = useRef<PagerView>(null);
  const slidesRefs = useRef<{[key: string]: React.RefObject<BaseSlideRef | null>}>({});
  const [currentPage, setCurrentPage] = useState(0);

  slides.forEach((slide) => {
    slidesRefs.current[slide.id] = createRef<BaseSlideRef | null>();
  });

  useEffect(() => {
    setTimeout(() => {
      slidesRefs.current[slides[0].id].current?.focus();
    }, 100);
  }, []);

  const goBack = (slide: SlideInterface) => {
    const currentSlideIdx = slides.findIndex((s) => s.id === slide.id);
    const prevSlide = (currentSlideIdx - 1) >= 0 ? slides[currentSlideIdx - 1] : slides[0];

    setTimeout(() => {
      slidesRefs.current[prevSlide.id].current?.focus();
    }, 0);

    if (currentPage > 0) {
      pagerViewRef.current?.setPage(currentPage - 1);
    }
  };

  const goNext = (slide: SlideInterface) => {
    const currentSlideIdx = slides.findIndex((s) => s.id === slide.id);
    const nextSlide = (currentSlideIdx + 1) <= (slides.length - 1)
      ? slides[currentSlideIdx + 1]
      : slides[(slides.length - 1)];

    setTimeout(() => {
      slidesRefs.current[nextSlide.id].current?.focus();
    }, 0);

    if (currentPage < slides.length - 1) {
      pagerViewRef.current?.setPage(currentPage + 1);
    }
  };

  const renderWelcomeSlide = (slide: SlideInterface) => (
    <BaseSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      canBack={ false }
      image={ require('../../../assets/images/icon.png') }
    />
  );

  const renderConfigureSlide = (slide: SlideInterface) => (
    <ConfigureSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      selectedDeviceType={ selectedDeviceType }
      configureDeviceType={ configureDeviceType }
    />
  );

  const renderProviderSlide = (slide: SlideInterface) => (
    <ProviderSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      selectedDeviceType={ selectedDeviceType }
    />
  );

  const renderCDNSlide = (slide: SlideInterface) => (
    <CDNSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      selectedDeviceType={ selectedDeviceType }
    />
  );

  const renderLoginSlide = (slide: SlideInterface) => (
    <LoginSlide
      ref={ slidesRefs.current[slide.id] }
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      selectedDeviceType={ selectedDeviceType }
    />
  );

  const renderCompleteSlide = (slide: SlideInterface) => (
    <BaseSlide
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

  const RENDER_MAP = {
    WELCOME: renderWelcomeSlide,
    CONFIGURE: renderConfigureSlide,
    PROVIDER: renderProviderSlide,
    CDN: renderCDNSlide,
    LOGIN: renderLoginSlide,
    COMPLETE: renderCompleteSlide,
  };

  const renderSlide = (slide: SlideInterface) => {
    const render = RENDER_MAP[slide.id] ?? noopFn;

    return render(slide);
  };

  return (
    <PagerView
      ref={ pagerViewRef }
      style={ { flex: 1 } }
      initialPage={ 0 }
      onPageSelected={ (e) => setCurrentPage(e.nativeEvent.position) }
      scrollEnabled={ false }
    >
      { slides.map((slide) => (
        <Wrapper key={ slide.id }>
          { renderSlide(slide) }
        </Wrapper>
      )) }
    </PagerView>
  );
};

export default WelcomePageComponent;
