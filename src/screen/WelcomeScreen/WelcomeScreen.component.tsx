import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useRef, useState } from 'react';
import PagerView from 'react-native-pager-view';
import { noopFn } from 'Util/Function';

import { BaseSlide, CDNSlide, ConfigureSlide, LoginSlide, ProviderSlide } from './SlideElements';
import { componentStyles } from './WelcomeScreen.style';
import { SlideInterface, WelcomeScreenComponentProps } from './WelcomeScreen.type';

export const WelcomeScreenComponent = ({
  slides,
  selectedDeviceType,
  configureDeviceType,
  complete,
}: WelcomeScreenComponentProps) => {
  const styles = useThemedStyles(componentStyles);
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
      image={ require('../../../assets/images/app-icon-all.png') }
      styles={ styles }
    />
  );

  const renderConfigureSlide = (slide: SlideInterface) => (
    <ConfigureSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      selectedDeviceType={ selectedDeviceType }
      configureDeviceType={ configureDeviceType }
      styles={ styles }
    />
  );

  const renderProviderSlide = (slide: SlideInterface) => (
    <ProviderSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      styles={ styles }
    />
  );

  const renderCDNSlide = (slide: SlideInterface) => (
    <CDNSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      styles={ styles }
    />
  );

  const renderLoginSlide = (slide: SlideInterface) => (
    <LoginSlide
      slide={ slide }
      goBack={ goBack }
      goNext={ goNext }
      styles={ styles }
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
      styles={ styles }
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
    <ThemedSafeArea edges={ ['top', 'bottom', 'left', 'right'] }>
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
    </ThemedSafeArea>
  );
};

export default WelcomeScreenComponent;
