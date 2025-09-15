import * as Application from 'expo-application';
import t from 'i18n/t';
import { CircleCheck, Clapperboard, CloudCog, FolderCog, MonitorCog, UserCog } from 'lucide-react-native';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useKeyboardController } from 'react-native-keyboard-controller';
import RNRestart from 'react-native-restart';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import { configureRemoteControl } from 'Util/RemoteControl';

import WelcomePageComponent from './WelcomePage.component';
import { DeviceType, SLIDE_TYPE, SlideInterface } from './WelcomePage.type';

export function WelcomePageContainer() {
  const { setEnabled } = useKeyboardController();
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);

  const slides: SlideInterface[] = [
    {
      id: SLIDE_TYPE.WELCOME,
      title: t('Welcome to %s', Application.applicationName ?? ''),
      subtitle: t('Your gateway to unlimited movies. Let’s set things up!'),
      IconComponent: Clapperboard,
    },
    {
      id: SLIDE_TYPE.CONFIGURE,
      title: t('Personalize Your Experience'),
      subtitle: t('Choose your device type for a tailored movie-watching journey.'),
      IconComponent: MonitorCog,

    },
    {
      id: SLIDE_TYPE.PROVIDER,
      title: t('Select Your Content Provider'),
      subtitle: t('Connect with streaming services for the best selection.'),
      IconComponent: CloudCog,
    },
    {
      id: SLIDE_TYPE.CDN,
      title: t('Optimize Streaming Performance'),
      subtitle: t('Choose a content delivery network (CDN) for faster streaming.'),
      IconComponent: FolderCog,
    },
    {
      id: SLIDE_TYPE.LOGIN,
      title: t('Sign In to an Account'),
      subtitle: t('Log in to sync your content and enjoy a seamless experience.'),
      IconComponent: UserCog,
    },
    {
      id: SLIDE_TYPE.COMPLETE,
      title: t('Setup Complete!'),
      subtitle: t('You’re all set. Grab some popcorn and start watching!'),
      IconComponent: CircleCheck,
    },
  ];

  useLayoutEffect(() => {
    configureRemoteControl();
  }, []);

  useEffect(() => {
    setEnabled(true);

    return () => {
      setEnabled(false);
    };
  }, []);

  const configureDeviceType = (type: DeviceType) => {
    setSelectedDeviceType(type);
    ConfigStore.configureDeviceType(type === DeviceType.TV);
  };

  const complete = () => {
    if (!selectedDeviceType) {
      NotificationStore.displayError(t('Please select a device type'));

      return;
    }

    ConfigStore.configureDevice(selectedDeviceType === DeviceType.TV);

    if (Platform.OS === 'web') {
      location.replace('/');
    } else {
      RNRestart.restart();
    }
  };

  const containerFunctions = {
    configureDeviceType,
    complete,
  };

  const containerProps = () => ({
    slides,
    selectedDeviceType,
  });

  return (
    <WelcomePageComponent
      { ...containerFunctions }
      { ...containerProps() }
    />
  );
}

export default WelcomePageContainer;
