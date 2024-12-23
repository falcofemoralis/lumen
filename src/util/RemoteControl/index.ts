import { EventSubscription, HWEvent, TVEventHandler } from 'react-native';
import { Directions, SpatialNavigation } from 'react-tv-space-navigation';
import { TVEventType } from 'Type/TVEvent.type';

SpatialNavigation.configureRemoteControl({
  remoteControlSubscriber: (callback) => {
    const mapping: { [key in TVEventType]: Directions | null } = {
      [TVEventType.Right]: Directions.RIGHT,
      [TVEventType.Left]: Directions.LEFT,
      [TVEventType.Up]: Directions.UP,
      [TVEventType.Down]: Directions.DOWN,
      [TVEventType.Select]: Directions.ENTER,
      [TVEventType.LongUp]: null,
      [TVEventType.LongDown]: null,
      [TVEventType.LongRight]: null,
      [TVEventType.LongLeft]: null,
      [TVEventType.Pan]: null,
      [TVEventType.Blur]: null,
      [TVEventType.Focus]: null,
    };

    const remoteControlListener = (evt: HWEvent) => {
      callback(mapping[evt.eventType as TVEventType]);

      return false;
    };

    return TVEventHandler.addListener(remoteControlListener);
  },

  remoteControlUnsubscriber: (eventSubscription: EventSubscription | undefined) => {
    eventSubscription?.remove();
  },
});
