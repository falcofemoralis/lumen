import { storage } from 'Util/Storage';
import { restoreCardCaches, setCardCachePublisher } from '../../source/search/CardCacheSync';
import { mutateCloudSync, mutateCloudSyncBatch } from './mutations';
import { CloudSyncMutation, CloudSyncState } from './types';
setCardCachePublisher((value, updatedAt) => mutateCloudSync({ entity: 'card-cache', id: JSON.stringify([value.kind, value.key]), value, updatedAt }));
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
