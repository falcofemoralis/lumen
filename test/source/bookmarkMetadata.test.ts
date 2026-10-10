import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BookmarkMetadataCache, BOOKMARK_METADATA_TTL } from '../../src/source/search/BookmarkMetadataCache';
import { FilmType } from 'Type/FilmType.type';
import { FilmCardInterface } from 'Type/FilmCard.interface';
const card: FilmCardInterface = { id: 'local-id', link: 'rezka-film', title: 'Film', poster: 'old', type: FilmType.SERIES, subtitle: '2020' };
test('bookmark metadata persists across restart, refreshes weekly and preserves library ID', async () => {
  const data = new Map<string, unknown>();
  const store = { load: <T>(key: string) => (data.get(key) ?? null) as T | null,
    save: (key: string, value: unknown) => { data.set(key, JSON.parse(JSON.stringify(value))); return true; } };
  let now = 1000, requests = 0;
  const resolve = async (input: FilmCardInterface) => {
    requests++;
    return { ...input, id: 'zona-id', link: 'zona-film', poster: 'new', info: 'Сезон 2 • серия 8 • завершён' };
  };
  const first = new BookmarkMetadataCache(store, resolve, () => now);
  assert.equal((await first.resolve(card)).id, card.id);
  const restart = new BookmarkMetadataCache(store, resolve, () => now);
  assert.equal(restart.peek(card).poster, 'new');
  assert.match((await restart.resolve(card)).info!, /завершён/);
  assert.equal(requests, 1);
  now += BOOKMARK_METADATA_TTL;
  await Promise.all([restart.resolve(card), restart.resolve(card)]);
  assert.equal(requests, 2);
});
test('failed metadata refresh keeps cached content and retries rather than stamping it fresh', async () => {
  const data = new Map<string, unknown>();
  const store = { load: <T>(key: string) => (data.get(key) ?? null) as T | null,
    save: (key: string, value: unknown) => { data.set(key, value); return true; } };
  let now = 1000, fail = false, requests = 0;
  const cache = new BookmarkMetadataCache(store, async (input) => {
    requests++;
    if (fail) throw new Error('offline');
    return { ...input, poster: 'cached' };
  }, () => now);
  await cache.resolve(card);
  now += BOOKMARK_METADATA_TTL; fail = true;
  assert.equal((await cache.resolve(card)).poster, 'cached');
  await cache.resolve(card);
  assert.equal(requests, 3);
});
