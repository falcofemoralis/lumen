import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setCardCachePublisher, restoreCardCaches } from '../../src/source/search/CardCacheSync';
import { BookmarkMetadataCache } from '../../src/source/search/BookmarkMetadataCache';
import { HomeCardCache, HOME_STATUS_TTL } from '../../src/source/search/HomeCardCache';
import { mergeCloudSyncState } from '../../src/util/CloudSync/merge';
import { isValidCloudSyncState } from '../../src/util/CloudSync/validation';
import { CloudSyncState } from '../../src/util/CloudSync/types';
import { FilmType } from '../../src/type/FilmType.type';
const makeStore = () => {
  const data = new Map<string, unknown>();
  return { load: <T>(key: string) => data.get(key) as T ?? null, save: (key: string, value: unknown) => { data.set(key, JSON.parse(JSON.stringify(value))); return true; } };
};
const card = { id: 'library', link: 'https://w1.zona.im/tvseries/cloud', title: 'Cloud', poster: 'poster.jpg', subtitle: '2020', type: FilmType.SERIES, isPendingRelease: true };
test('cloud transfer restores bookmark status to a running cache without any source request or echo', async () => {
  const records: Record<string, any> = {};
  let published = 0;
  setCardCachePublisher((value, checked) => { published++; records[JSON.stringify([value.kind, value.key])] = { value, meta: { updatedAt: checked, deviceId: 'first' } }; });
  try {
    const origin = new BookmarkMetadataCache(makeStore(), async input => ({ ...input, info: 'Сезон 2 • серия 8 • завершён', isPendingRelease: false }), () => 1000);
    await origin.resolve(card);
    let requests = 0;
    const destinationStore = makeStore();
    const destination = new BookmarkMetadataCache(destinationStore, async input => { requests++; return input; }, () => 1001);
    assert.equal(destination.peek(card).isPendingRelease, true);
    assert.equal(restoreCardCaches(records, destinationStore), true);
    assert.equal((await destination.resolve(card)).isPendingRelease, false);
    assert.match(destination.peek(card).info!, /серия 8.*завершён/);
    assert.equal(requests, 0);
    assert.equal(published, 1);
    assert.equal(restoreCardCaches(records, destinationStore), false);
  } finally { setCardCachePublisher(() => {}); }
});
test('Home cloud transfer preserves daily expiry and refuses older metadata', () => {
  const records: Record<string, any> = {};
  setCardCachePublisher((value, checked) => { records[value.kind] = { value, meta: { updatedAt: checked, deviceId: 'a' } }; });
  try {
    const origin = new HomeCardCache(makeStore(), () => 1000);
    origin.remember(card, { ...card, info: 'Серия 4 · Выходит', ratings: { imdb: 8 } });
    origin.rememberCatalog('series:', { films: [card], totalPages: 3 });
    const target = makeStore();
    let now = 2000;
    const destination = new HomeCardCache(target, () => now);
    restoreCardCaches(records, target);
    assert.equal(destination.peek(card).ratings?.imdb, 8);
    assert.equal(destination.catalog('series:')?.films[0].poster, card.poster);
    assert.equal(destination.isFresh(card), true);
    now = 1000 + HOME_STATUS_TTL;
    assert.equal(destination.isFresh(card), false);
    const older = { ...records['home-cards'], value: { ...records['home-cards'].value, entry: { ...records['home-cards'].value.entry, checked: 900, card: { ...card, info: 'old' } } } };
    assert.equal(restoreCardCaches({ older }, target), false);
    assert.match(destination.peek(card).info!, /Серия 4/);
  } finally { setCardCachePublisher(() => {}); }
});
test('cache records merge by verification date; legacy cloud replicas remain valid', () => {
  const base: CloudSyncState = { schemaVersion: 1, revision: 0, updatedAt: 1, deviceId: 'a', bookmarks: { categories: {}, memberships: {} }, history: {}, playerTime: {}, scheduleMarks: {}, comments: {}, settings: { values: {}, metadata: {} } };
  assert.equal(isValidCloudSyncState(base), true);
  const newer = { value: 'fresh', meta: { updatedAt: 2000, deviceId: 'a' } };
  const older = { value: 'old', meta: { updatedAt: 1000, deviceId: 'b' } };
  const merged = mergeCloudSyncState({ ...base, cardCache: { film: newer } }, { ...base, cardCache: { film: older } });
  assert.equal((merged.cardCache!.film as any).value, 'fresh');
  assert.equal(isValidCloudSyncState(merged), true);
  assert.equal(isValidCloudSyncState({ ...base, cardCache: { invalid: {} } }), false);
});