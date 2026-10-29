import { CloudSyncEvent } from './types';

type Listener = (event: CloudSyncEvent) => void;

const listeners = new Set<Listener>();

export const subscribeCloudSync = (listener: Listener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const emitCloudSyncEvent = (event: CloudSyncEvent): void => {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      console.error('[CloudSync] Event listener failed:', error);
    }
  }
};


export const flushCloudSync = (): void => {
  emitCloudSyncEvent({ type: 'flush' });
};
