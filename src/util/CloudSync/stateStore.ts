import type { CloudSyncState } from './types';

type Store = { load<T>(key: string): T | null; save(key: string, value: unknown): boolean };
const STATE_KEY = 'cloudSyncState';
const CACHE_KEY = 'cloudSyncCardCache';
type StoredState = CloudSyncState & { cardCacheVersion?: string };

/** Keep large poster payloads out of frequent bookmark and playback writes. */
export function createCloudStateStore(store: Store) {
  let cachedVersion: string | undefined;
  let cachedCards: CloudSyncState['cardCache'];
  let serial = 0;

  return {
    load(): CloudSyncState | null {
      const stored = store.load<StoredState>(STATE_KEY);
      if (!stored || typeof stored !== 'object') return null;
      const { cardCacheVersion, ...state } = stored;
      if (state.cardCache) return state;
      if (!cardCacheVersion) return state;
      if (cachedVersion !== cardCacheVersion) {
        cachedCards = store.load<NonNullable<CloudSyncState['cardCache']>>(CACHE_KEY) ?? {};
        cachedVersion = cardCacheVersion;
      }

      return { ...state, cardCache: { ...cachedCards } };
    },
    save(state: CloudSyncState): void {
      const { cardCache, ...core } = state;
      const keys = Object.keys(cardCache ?? {});
      const changed = !cachedVersion || keys.length !== Object.keys(cachedCards ?? {}).length
        || keys.some(key => cardCache![key] !== cachedCards?.[key]);
      if (changed) {
        if (!store.save(CACHE_KEY, cardCache ?? {})) throw new Error('Failed to save cloud poster cache');
        cachedCards = { ...cardCache };
        cachedVersion = `${Date.now().toString(36) }-${ Math.random().toString(36).slice(2) }-${ ++serial}`;
      }
      if (!store.save(STATE_KEY, { ...core, cardCacheVersion: cachedVersion })) {
        throw new Error('Failed to save cloud state');
      }
    },
  };
}
