import Wrapper from 'Component/Wrapper';
import React, { useState } from 'react';
import { View } from 'react-native';
import { noopFn } from 'Util/Function';

import { BaseSlide, CDNSlide, ConfigureSlide, LoginSlide, ProviderSlide } from './SlideElements';
import { SlideInterface, WelcomePageComponentProps } from './WelcomePage.type';

export const WelcomePageComponent = ({
  slides,
  selectedDeviceType,
  configureDeviceType,
  complete,
}: WelcomePageComponentProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const goBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goNext = () => {
    if (currentPage < slides.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const RENDER_MAP = {
    WELCOME: (slide: SlideInterface) => (
      <BaseSlide
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
        canBack={ false }
        image={ require('../../../assets/images/icon.png') }
      />
    ),
    CONFIGURE: (slide: SlideInterface) => (
      <ConfigureSlide
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
        selectedDeviceType={ selectedDeviceType }
        configureDeviceType={ configureDeviceType }
      />
    ),
    PROVIDER: (slide: SlideInterface) => (
      <ProviderSlide
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
      />
    ),
    CDN: (slide: SlideInterface) => (
      <CDNSlide
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
      />
    ),
    LOGIN: (slide: SlideInterface) => (
      <LoginSlide
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
      />
    ),
    COMPLETE: (slide: SlideInterface) => (
      <BaseSlide
        slide={ slide }
        goBack={ goBack }
        goNext={ goNext }
        style={ { flex: 1 } }
        canNext={ false }
        canComplete
        complete={ complete }
      />
    ),
  };

  const renderSlide = (slide: SlideInterface) => {
    const render = RENDER_MAP[slide.id] ?? noopFn;

    return render(slide);
  };

  return (
    <View style={ { flex: 1 } }>
      { slides[currentPage] && renderSlide(slides[currentPage]) }
    </View>
  );
};

export default WelcomePageComponent;
