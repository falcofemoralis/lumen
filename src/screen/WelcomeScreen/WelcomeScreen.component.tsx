import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { Wrapper } from 'Component/Wrapper';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useMemo, useState } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

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
  const [currentPage, setCurrentPage] = useState(0);

  const goBack = (_slide: SlideInterface) => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goNext = (_slide: SlideInterface) => {
    if (currentPage < slides.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

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

  const renderLoginSlide = (slide: SlideInterface) => (
    <LoginSlide
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

  const activeSlide = useMemo(() => slides[currentPage], [currentPage, slides]);

  return (
    <ThemedSafeArea edges={ ['top', 'bottom', 'left', 'right'] }>
      <Animated.View
        key={ activeSlide.id }
        entering={ FadeIn }
        exiting={ FadeOut }
        layout={ LinearTransition }
        style={ styles.page }
      >
        <Wrapper style={ styles.wrapper }>
          { RENDER_MAP[activeSlide.id](activeSlide) }
        </Wrapper>
      </Animated.View>
    </ThemedSafeArea>
  );
};

export default WelcomeScreenComponent;
