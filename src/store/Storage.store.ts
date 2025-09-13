import { MMKV } from 'react-native-mmkv';

class StorageStore {
  private configStorage: MMKV|null = null;
  private cookiesStorage: MMKV|null = null;
  private playerStorage: MMKV|null = null;
  private miscStorage: MMKV|null = null;
  private debugStorage: MMKV|null = null;

  getConfigStorage() {
    if (!this.configStorage) {
      this.configStorage = new MMKV({ id: 'config' });
    }

    return this.configStorage;
  }

  getCookiesStorage() {
    if (!this.cookiesStorage) {
      this.cookiesStorage = new MMKV({ id: 'cookies' });
    }

    return this.cookiesStorage;
  }

  getPlayerStorage() {
    if (!this.playerStorage) {
      this.playerStorage = new MMKV({ id: 'player' });
    }

    return this.playerStorage;
  }

  getMiscStorage() {
    if (!this.miscStorage) {
      this.miscStorage = new MMKV({ id: 'misc' });
    }

    return this.miscStorage;
  }

  getDebugStorage() {
    if (!this.debugStorage) {
      this.debugStorage = new MMKV({ id: 'debug' });
    }

    return this.debugStorage;
  }
}

export default new StorageStore();