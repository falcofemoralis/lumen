import { createMMKV, MMKV } from 'react-native-mmkv';

class StorageWrapper {
  private mmkvStorage: MMKV;

  constructor(store: MMKV) {
    this.mmkvStorage = store;
  }

  getMMKVInstance(): MMKV {
    return this.mmkvStorage;
  }

  /**
   * Loads a string from storage.
   *
   * @param key The key to fetch.
   */
  loadString(key: string): string | null {
    try {
      return this.mmkvStorage.getString(key) ?? null;
    } catch {
      // not sure why this would fail... even reading the RN docs I'm unclear
      return null;
    }
  }

  /**
   * Saves a string to storage.
   *
   * @param key The key to fetch.
   * @param value The value to store.
   */
  saveString(key: string, value: string): boolean {
    try {
      this.mmkvStorage.set(key, value);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Loads something from storage and runs it thru JSON.parse.
   *
   * @param key The key to fetch.
   */
  load<T>(key: string): T | null {
    let almostThere: string | null = null;
    try {
      almostThere = this.loadString(key);

      return JSON.parse(almostThere ?? '') as T;
    } catch {
      return (almostThere as T) ?? null;
    }
  }

  /**
   * Saves an object to storage.
   *
   * @param key The key to fetch.
   * @param value The value to store.
   */
  save(key: string, value: unknown): boolean {
    try {
      this.saveString(key, JSON.stringify(value));

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes something from storage.
   *
   * @param key The key to kill.
   */
  remove(key: string): void {
    try {
      this.mmkvStorage.remove(key);
    } catch {}
  }

  /**
   * Burn it all to the ground.
   */
  clear(): void {
    try {
      this.mmkvStorage.clearAll();
    } catch {}
  }
}

class Storage {
  private configStorage: StorageWrapper|null = null;
  private cookiesStorage: StorageWrapper|null = null;
  private playerStorage: StorageWrapper|null = null;
  private miscStorage: StorageWrapper|null = null;

  getConfigStorage() {
    if (!this.configStorage) {
      this.configStorage = new StorageWrapper(createMMKV({ id: 'config' }));
    }

    return this.configStorage;
  }

  getCookiesStorage() {
    if (!this.cookiesStorage) {
      this.cookiesStorage = new StorageWrapper(createMMKV({ id: 'cookies' }));
    }

    return this.cookiesStorage;
  }

  getPlayerStorage() {
    if (!this.playerStorage) {
      this.playerStorage = new StorageWrapper(createMMKV({ id: 'player' }));
    }

    return this.playerStorage;
  }

  getMiscStorage() {
    if (!this.miscStorage) {
      this.miscStorage = new StorageWrapper(createMMKV({ id: 'misc' }));
    }

    return this.miscStorage;
  }
}

export const storage = new Storage();