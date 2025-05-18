import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import { useServiceContext } from 'Context/ServiceContext';
import * as Application from 'expo-application';
import t from 'i18n/t';
import { useState } from 'react';
import RNRestart from 'react-native-restart';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import { FilmInterface } from 'Type/Film.interface';

import WelcomePageComponent from './WelcomePage.component';
import { TEST_URL } from './WelcomePage.config';
import { DeviceType, SLIDE_TYPE, SlideInterface } from './WelcomePage.type';

export function WelcomePageContainer() {
  const {
    profile,
    getCurrentService,
    updateProvider,
    updateCDN,
    login,
    validateUrl,
  } = useServiceContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(getCurrentService().getProvider());
  const [selectedCDN, setSelectedCDN] = useState<string | null>(getCurrentService().getCDN());
  const [isProviderValid, setIsProviderValid] = useState<boolean | null>(null);
  const [isCDNValid, setIsCDNValid] = useState<boolean | null>(null);

  const slides: SlideInterface[] = [
    {
      id: SLIDE_TYPE.WELCOME,
      title: t('Welcome to %s', Application.applicationName ?? ''),
      subtitle: t('Your gateway to unlimited movies. Let’s set things up!'),
      icon: {
        name: 'movie-open-play',
        pack: IconPackType.MaterialCommunityIcons,
      },
    },
    {
      id: SLIDE_TYPE.CONFIGURE,
      title: t('Personalize Your Experience'),
      subtitle: t('Choose your device type for a tailored movie-watching journey.'),
      icon: {
        name: 'cog',
        pack: IconPackType.MaterialCommunityIcons,
      },
    },
    {
      id: SLIDE_TYPE.PROVIDER,
      title: t('Select Your Content Provider'),
      subtitle: t('Connect with streaming services for the best selection.'),
      icon: {
        name: 'server-network',
        pack: IconPackType.MaterialCommunityIcons,
      },
    },
    {
      id: SLIDE_TYPE.CDN,
      title: t('Optimize Streaming Performance'),
      subtitle: t('Choose a content delivery network (CDN) for faster streaming.'),
      icon: {
        name: 'speedometer',
        pack: IconPackType.MaterialCommunityIcons,
      },
    },
    {
      id: SLIDE_TYPE.LOGIN,
      title: t('Sign In to an Account'),
      subtitle: t('Log in to sync your content and enjoy a seamless experience.'),
      icon: {
        name: 'account',
        pack: IconPackType.MaterialCommunityIcons,
      },
    },
    {
      id: SLIDE_TYPE.COMPLETE,
      title: t('Setup Complete!'),
      subtitle: t('You’re all set. Grab some popcorn and start watching!'),
      icon: {
        name: 'check-circle',
        pack: IconPackType.MaterialCommunityIcons,
      },
    },
  ];

  const reloadApp = () => {
    RNRestart.restart();
  };

  const handleSelectTV = () => {
    setSelectedDeviceType('TV');
  };

  const handleSelectMobile = () => {
    setSelectedDeviceType('MOBILE');
  };

  const validateProvider = async () => {
    setIsLoading(true);

    try {
      await getCurrentService().getFilm(TEST_URL);

      setIsProviderValid(true);
    } catch (error) {
      NotificationStore.displayError(t('Invalid provider'));
      setIsProviderValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProvider = async (value: string) => {
    await updateProvider(value, true);
  };

  const handleValidateCDN = async () => {
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
  };

  const handleUpdateCDN = async (value: string) => {
    await updateCDN(value, true);
  };

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      await login(username, password);
    } catch (error) {
      NotificationStore.displayError(t('Invalid credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const complete = async () => {
    if (!selectedDeviceType) {
      NotificationStore.displayError(t('Please select a device type'));

      return;
    }

    await ConfigStore.configureDevice(selectedDeviceType === 'TV');
    reloadApp();
  };

  const containerFunctions = {
    handleSelectTV,
    handleSelectMobile,
    validateProvider,
    updateProvider: handleUpdateProvider,
    validateCDN: handleValidateCDN,
    updateCDN: handleUpdateCDN,
    complete,
    setSelectedProvider,
    setSelectedCDN,
    login: handleLogin,
  };

  const containerProps = () => ({
    slides,
    selectedDeviceType,
    isLoading,
    isProviderValid,
    isCDNValid,
    selectedProvider,
    selectedCDN,
    profile,
  });

  return (
    <WelcomePageComponent
      { ...containerFunctions }
      { ...containerProps() }
    />
  );
}

export default WelcomePageContainer;
