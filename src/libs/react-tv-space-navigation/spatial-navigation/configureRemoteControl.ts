import { Direction } from '@bam.tech/lrud';

 
type SubscriberType = any;

export interface RemoteControlConfiguration {
  remoteControlSubscriber: (lrudCallback: (direction: Direction | null) => void) => SubscriberType;
  remoteControlUnsubscriber: (subscriber: SubscriberType) => void;
}

const config: Partial<RemoteControlConfiguration> = {};

export const configureRemoteControl = (options: RemoteControlConfiguration) => {
  config.remoteControlSubscriber = options.remoteControlSubscriber;
  config.remoteControlUnsubscriber = options.remoteControlUnsubscriber;
};

export const getRemoteControlSubscriber = () => config.remoteControlSubscriber;
export const getRemoteControlUnsubscriber = () => config.remoteControlUnsubscriber;