import Wrapper from 'Component/Wrapper';
import React, {
  useRef,
  useState,
} from 'react';
import PagerView from 'react-native-pager-view';
import { noopFn } from 'Util/Function';

import { BaseSlide, CDNSlide, ConfigureSlide, LoginSlide, ProviderSlide } from './SlideElements';
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
  const [currentPage, setCurrentPage] = useState(0);

  const goBack = (_slide: SlideInterface) => {
    if (currentPage > 0) {
      pagerViewRef.current?.setPageWithoutAnimation(currentPage - 1);
    }
  };

  const goNext = (_slide: SlideInterface) => {
    if (currentPage < slides.length - 1) {
      pagerViewRef.current?.setPageWithoutAnimation(currentPage + 1);
    }
  };

  const isSlideActive = (slide: SlideInterface) => slides.findIndex((s) => s.id === slide.id) === currentPage;

  const renderWelcomeSlide = (slide: SlideInterface) => (
    <BaseSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      canBack={ false }
      image={ require('../../../assets/images/icon.png') }
    />
  );

  const renderConfigureSlide = (slide: SlideInterface) => (
    <ConfigureSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      selectedDeviceType={ selectedDeviceType }
      configureDeviceType={ configureDeviceType }
    />
  );

  const renderProviderSlide = (slide: SlideInterface) => (
    <ProviderSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
    />
  );

  const renderCDNSlide = (slide: SlideInterface) => (
    <CDNSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
    />
  );

  const renderLoginSlide = (slide: SlideInterface) => (
    <LoginSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
    />
  );

  const renderCompleteSlide = (slide: SlideInterface) => (
    <BaseSlide
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

    return isSlideActive(slide) ? render(slide) : null;
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
