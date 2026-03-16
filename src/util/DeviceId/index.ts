import { storage } from 'Util/Storage';

let globalDeviceId: string|null = null;

export const getDeviceId = (isShort = false) => {
  if (!globalDeviceId) {
    let currentDeviceId = storage.getMiscStorage().loadString('deviceId');

    if (!currentDeviceId) {
      currentDeviceId = String(Date.now());
      storage.getMiscStorage().saveString('deviceId', currentDeviceId);
    }

    globalDeviceId = currentDeviceId;
  }

  if (isShort) {
    return globalDeviceId.slice(-5);
  }

  return globalDeviceId;
};