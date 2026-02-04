import { useConfigContext } from 'Context/ConfigContext';
import * as Application from 'expo-application';
import { t } from 'i18n/translate';
import { CircleCheck, Clapperboard, CloudCog, FolderCog, MonitorCog, UserCog } from 'lucide-react-native';
import { useLayoutEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { restartApp } from 'Util/Device';
import { configureRemoteControl } from 'Util/RemoteControl';

import WelcomeScreenComponent from './WelcomeScreen.component';
import { DeviceType, SLIDE_TYPE, SlideInterface } from './WelcomeScreen.type';

export function WelcomeScreenContainer() {
  const { setConfig } = useConfigContext();
  const [selectedDeviceType, setSelectedDeviceType] = useState<DeviceType | null>(null);

  const slides: SlideInterface[] = [
    {
      id: SLIDE_TYPE.WELCOME,
      title: t('Welcome to {{name}}', { name: Application.applicationName ?? '' }),
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

  const configureDeviceType = (type: DeviceType) => {
    setSelectedDeviceType(type);
    setConfig('isTV', type === DeviceType.TV);
  };

  const complete = () => {
    if (!selectedDeviceType) {
      NotificationStore.displayError(t('Please select a device type'));

      return;
    }

    setConfig('isConfigured', true);

    restartApp();
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
    <WelcomeScreenComponent
      { ...containerFunctions }
      { ...containerProps() }
    />
  );
}

export default WelcomeScreenContainer;
