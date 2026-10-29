import { storage } from 'Util/Storage';
import { restoreCardCaches, setCardCachePublisher } from '../../source/search/CardCacheSync';
import { mutateCloudSyncBatch } from './mutations';
import { CloudSyncMutation, CloudSyncState } from './types';
const pendingCacheMutations = new Map<string, CloudSyncMutation>();
let publishTimer: ReturnType<typeof setTimeout> | undefined;
setCardCachePublisher((value, updatedAt) => {
  const id = JSON.stringify([value.kind, value.key]);
  pendingCacheMutations.set(id, { entity: 'card-cache', id, value, updatedAt });
  if (!publishTimer) publishTimer = setTimeout(() => {
    publishTimer = undefined;
    const batch = Array.from(pendingCacheMutations.values());
    pendingCacheMutations.clear();
    mutateCloudSyncBatch(batch);
  }, 250);
});
export const restoreCloudCardCache = (state: CloudSyncState) => restoreCardCaches(state.cardCache ?? {}, storage.getMiscStorage());
export const publishExistingCardCaches = () => {
  const mutations: CloudSyncMutation[] = [];
  const collect = (kind: string, key: string, entry: object, updatedAt: number) => mutations.push({ entity: 'card-cache', id: JSON.stringify([kind, key]), value: { kind, key, entry }, updatedAt });
  const store = storage.getMiscStorage();
  const bookmarks = store.load<Record<string, any>>('bookmark-metadata-v1') ?? {};
  const home = store.load<{ cards?: Record<string, any>; catalogs?: Record<string, any> }>('home-card-cache-v1');
  for (const [key, entry] of Object.entries(bookmarks)) if (Number.isFinite(entry.updatedAt)) collect('bookmarks', key, entry, entry.updatedAt);
  for (const [key, entry] of Object.entries(home?.cards ?? {})) if (Number.isFinite(entry.checked)) collect('home-cards', key, entry, entry.checked);
  for (const [key, entry] of Object.entries(home?.catalogs ?? {})) if (Number.isFinite(entry.checked)) collect('home-catalogs', key, entry, entry.checked);
  mutateCloudSyncBatch(mutations);
};
