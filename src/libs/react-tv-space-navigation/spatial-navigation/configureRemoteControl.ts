import { Direction } from '@bam.tech/lrud';

type SubscriberType = any;

export interface RemoteControlConfiguration {
  remoteControlSubscriber: (lrudCallback: (direction: Direction | null) => void) => SubscriberType;
  remoteControlUnsubscriber: (subscriber: SubscriberType) => void;
}
export const RemoteController: {
  remoteControlSubscriber:
  | RemoteControlConfiguration['remoteControlSubscriber']
  | undefined,
  remoteControlUnsubscriber:
  | RemoteControlConfiguration['remoteControlUnsubscriber']
  | undefined;
} = {
  remoteControlSubscriber: undefined,
  remoteControlUnsubscriber: undefined,
}

export const configureRemoteControl = (options: RemoteControlConfiguration) => {
  RemoteController.remoteControlSubscriber = options.remoteControlSubscriber;
  RemoteController.remoteControlUnsubscriber = options.remoteControlUnsubscriber;
};
