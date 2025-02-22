import { Directions, SpatialNavigation } from 'react-tv-space-navigation';

import RemoteControlManager from './RemoteControlManager';
import { SupportedKeys } from './SupportedKeys';

export const configureRemoteControl = () => {
  RemoteControlManager.subscribe();

  SpatialNavigation.configureRemoteControl({
    remoteControlSubscriber: (callback) => {
      const mapping: { [key in SupportedKeys]: Directions | null } = {
        [SupportedKeys.RIGHT]: Directions.RIGHT,
        [SupportedKeys.LEFT]: Directions.LEFT,
        [SupportedKeys.UP]: Directions.UP,
        [SupportedKeys.DOWN]: Directions.DOWN,
        [SupportedKeys.ENTER]: Directions.ENTER,
        [SupportedKeys.LONG_ENTER]: Directions.LONG_ENTER,
        [SupportedKeys.BACK]: null,
      };

      const remoteControlListener = (keyEvent: SupportedKeys) => {
        callback(mapping[keyEvent]);

        return false;
      };

      return RemoteControlManager.addKeydownListener(remoteControlListener);
    },

    remoteControlUnsubscriber: (remoteControlListener) => {
      RemoteControlManager.removeKeydownListener(remoteControlListener);
    },
  });
};
