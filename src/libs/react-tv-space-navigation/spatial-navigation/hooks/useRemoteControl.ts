import { useEffect } from 'react';

import { RemoteController } from '../configureRemoteControl';
import { useSpatialNavigationDeviceType } from '../context/DeviceContext';
import SpatialNavigator from '../SpatialNavigator';

export const useRemoteControl = ({
  spatialNavigator,
  isActive,
}: {
  spatialNavigator: SpatialNavigator;
  isActive: boolean;
}) => {
  const { setDeviceType, setScrollingIntervalId: setScrollingId } = useSpatialNavigationDeviceType();

  useEffect(() => {
    if (!RemoteController.remoteControlSubscriber) {
      console.warn(
        '[React Spatial Navigation] You probably forgot to configure the remote control. Please call the configuration function.',
      );

      return;
    }

    if (!isActive) {
      return () => undefined;
    }

    const listener = RemoteController.remoteControlSubscriber((direction) => {
      setDeviceType('remoteKeys');
      spatialNavigator.handleKeyDown(direction);
      setScrollingId(null);
    });

    return () => {
      if (!RemoteController.remoteControlUnsubscriber) {
        console.warn(
          '[React Spatial Navigation] You did not provide a remote control unsubscriber. Are you sure you called configuration correctly?',
        );

        return;
      }
      RemoteController.remoteControlUnsubscriber(listener);
    };
  }, [spatialNavigator, isActive, setDeviceType, setScrollingId]);
};
