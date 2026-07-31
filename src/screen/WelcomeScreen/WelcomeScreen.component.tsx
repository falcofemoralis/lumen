import { ThemedSafeArea } from 'Component/ThemedSafeArea';
import { Wrapper } from 'Component/Wrapper';
import * as Application from 'expo-application';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { CircleCheck, Clapperboard, CloudCog, FolderCog, MonitorCog, UserCog } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { BaseSlide } from './Slides/BaseSlide';
import { CDNSlide } from './Slides/CDNSlide';
import { CompleteSlide } from './Slides/CompleteSlide';
import { ConfigureSlide } from './Slides/ConfigureSlide';
import { LoginSlide } from './Slides/LoginSlide';
import { ProviderSlide } from './Slides/ProviderSlide';
import { componentStyles } from './WelcomeScreen.style';
import { SLIDE_TYPE } from './WelcomeScreen.type';

export const WelcomeScreenComponent = () => {
  const styles = useThemedStyles(componentStyles);
  const [currentSlide, setCurrentSlide] = useState<SLIDE_TYPE>(SLIDE_TYPE.WELCOME);

  const handleChangeSlide = useCallback((slide: SLIDE_TYPE) => {
    setCurrentSlide(slide);
  }, []);

  const renderCurrentSlide = () => {
    switch (currentSlide) {
      case SLIDE_TYPE.WELCOME:
        return (
          <BaseSlide
            title={ t('Welcome to {{name}}', { name: Application.applicationName ?? '' }) }
            subtitle={ t('Your gateway to unlimited movies. Let’s set things up!') }
            IconComponent={ Clapperboard }
            goNext={ () => handleChangeSlide(SLIDE_TYPE.CONFIGURE) }
            image={ require('../../../assets/images/app-icon-all.png') }
            styles={ styles }
          />
        );
      case SLIDE_TYPE.CONFIGURE:
        return (
          <ConfigureSlide
            title={ t('Personalize Your Experience') }
            subtitle={ t('Choose your device type for a tailored movie-watching journey.') }
            IconComponent={ MonitorCog }
            goBack={ () => handleChangeSlide(SLIDE_TYPE.WELCOME) }
            goNext={ () => handleChangeSlide(SLIDE_TYPE.PROVIDER) }
            styles={ styles }
          />
        );
      case SLIDE_TYPE.PROVIDER:
        return (
          <ProviderSlide
            title={ t('Select Your Content Provider') }
            subtitle={ t('Connect with streaming services for the best selection.') }
            IconComponent={ CloudCog }
            goBack={ () => handleChangeSlide(SLIDE_TYPE.CONFIGURE) }
            goNext={ () => handleChangeSlide(SLIDE_TYPE.LOGIN) }
            styles={ styles }
          />
        );
      case SLIDE_TYPE.LOGIN:
        return (
          <LoginSlide
            title={ t('Sign In to an Account') }
            subtitle={ t('Log in to sync your content and enjoy a seamless experience.') }
            IconComponent={ UserCog }
            goBack={ () => handleChangeSlide(SLIDE_TYPE.PROVIDER) }
            goNext={ () => handleChangeSlide(SLIDE_TYPE.CDN) }
            styles={ styles }
          />
        );
      case SLIDE_TYPE.CDN:
        return (
          <CDNSlide
            title={ t('Optimize Streaming Performance') }
            subtitle={ t('Choose a content delivery network (CDN) for faster streaming.') }
            IconComponent={ FolderCog }
            goBack={ () => handleChangeSlide(SLIDE_TYPE.LOGIN) }
            goNext={ () => handleChangeSlide(SLIDE_TYPE.COMPLETE) }
            styles={ styles }
          />
        );
      case SLIDE_TYPE.COMPLETE:
        return (
          <CompleteSlide
            title={ t('Setup Complete!') }
            subtitle={ t('You’re all set. Grab some popcorn and start watching!') }
            IconComponent={ CircleCheck }
            goBack={ () => handleChangeSlide(SLIDE_TYPE.CDN) }
            styles={ styles }
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemedSafeArea edges={ ['top', 'bottom', 'left', 'right'] }>
      <Animated.View
        key={ currentSlide }
        entering={ FadeIn }
        exiting={ FadeOut }
        layout={ LinearTransition }
        style={ styles.page }
      >
        <Wrapper style={ styles.wrapper }>
          { renderCurrentSlide() }
        </Wrapper>
      </Animated.View>
    </ThemedSafeArea>
  );
};

export default WelcomeScreenComponent;
