import { TVEventType } from 'Type/TVEvent.type';
import { EventSubscription, HWEvent, TVEventHandler } from 'react-native';
import { Directions, SpatialNavigation } from 'react-tv-space-navigation';

class TVEventHandlerManagerClass {
  subscription: EventSubscription | undefined;

  addListener(remoteControlListener: (evt: HWEvent) => void) {
    this.subscription = TVEventHandler.addListener(remoteControlListener);
  }

  removeListener() {
    if (this.subscription) {
      this.subscription.remove();
    }
  }
}

const TVEventHandlerManager = new TVEventHandlerManagerClass();

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

    TVEventHandlerManager.addListener(remoteControlListener);
  },

  remoteControlUnsubscriber: (remoteControlListener) => {
    TVEventHandlerManager.removeListener();
  },
});
