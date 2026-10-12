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

test('legacy anime bookmark cache checks Anixart once without waiting for the weekly expiry', async () => {
  const anime = { ...card, type: FilmType.ANIME };
  const entries = { [anime.link]: { updatedAt: 1000, card: anime } };
  let requests = 0;
  const store = { load: <T>() => entries as T, save: (_key: string, _value: unknown) => true };
  const cache = new BookmarkMetadataCache(store, async (input) => {
    requests++;
    return { ...input, link: 'https://anixart-app.com/release/1' };
  }, () => 1001);
  assert.equal((await cache.resolve(anime)).link, 'https://anixart-app.com/release/1');
  await cache.resolve(anime);
  assert.equal(requests, 1);
});
test('old weekly series metadata refreshes status once even before the TTL expires', async () => {
  const data = new Map<string, unknown>([['bookmark-metadata-v1', {
    [card.link]: { updatedAt: 1000, card, animationSourceChecked: true },
  }]]);
  const store = { load: <T>(key: string) => (data.get(key) ?? null) as T | null,
    save: (key: string, value: unknown) => { data.set(key, value); return true; } };
  let requests = 0;
  const resolve = async (input: FilmCardInterface) => {
    requests++;
    return { ...input, info: 'Сезон 2 · серия 8 · Завершён' };
  };
  const cache = new BookmarkMetadataCache(store, resolve, () => 1001);
  assert.match((await cache.resolve(card)).info!, /серия 8/);
  const restart = new BookmarkMetadataCache(store, resolve, () => 1002);
  assert.match((await restart.resolve(card)).info!, /Завершён/);
  assert.equal(requests, 1);
});test('legacy native bookmark captions refresh once, then persist the normal weekly interval', async () => {
  const native = { ...card, type: FilmType.FILM, link: 'https://w1.zona.im/movies/caption' };
  const data = new Map<string, unknown>([['bookmark-metadata-v1', {
    [native.link]: { updatedAt: 1000, card: native, animationSourceChecked: true, seriesInfoChecked: true },
  }]]);
  const store = { load: <T>(key: string) => (data.get(key) ?? null) as T | null,
    save: (key: string, value: unknown) => { data.set(key, JSON.parse(JSON.stringify(value))); return true; } };
  let calls = 0;
  const resolve = async (input: FilmCardInterface) => {
    calls++;
    return { ...input, subtitle: '2020, США, комедия' };
  };
  const first = new BookmarkMetadataCache(store, resolve, () => 1001);
  assert.equal((await first.resolve(native)).subtitle, '2020, США, комедия');
  const restarted = new BookmarkMetadataCache(store, resolve, () => 1002);
  assert.equal((await restarted.resolve(native)).subtitle, '2020, США, комедия');
  assert.equal(calls, 1);
});


test('legacy pending bookmark refreshes availability once, then keeps weekly caching', async () => {
  const pending = { ...card, isPendingRelease: true };
  const data = new Map<string, unknown>([['bookmark-metadata-v1', {
    [pending.link]: { updatedAt: 1000, card: pending, animationSourceChecked: true, seriesInfoChecked: true, subtitleChecked: true },
  }]]);
  const store = { load: <T>(key: string) => (data.get(key) ?? null) as T | null,
    save: (key: string, value: unknown) => { data.set(key, JSON.parse(JSON.stringify(value))); return true; } };
  let calls = 0;
  const resolve = async (input: FilmCardInterface) => {
    calls++;
    return { ...input, isPendingRelease: false };
  };
  const cache = new BookmarkMetadataCache(store, resolve, () => 1001);
  assert.equal((await cache.resolve(pending)).isPendingRelease, false);
  const restarted = new BookmarkMetadataCache(store, resolve, () => 1002);
  assert.equal((await restarted.resolve(pending)).isPendingRelease, false);
  assert.equal(calls, 1);
});

test('previously checked series bookmarks refresh status once after the metadata migration', async () => {
  const data = new Map<string, unknown>([['bookmark-metadata-v1', {
    [card.link]: { updatedAt: 1000, card, animationSourceChecked: true, seriesInfoChecked: true,
      subtitleChecked: true, availabilityChecked: true },
  }]]);
  const store = { load: <T>(key: string) => (data.get(key) ?? null) as T | null,
    save: (key: string, value: unknown) => { data.set(key, JSON.parse(JSON.stringify(value))); return true; } };
  let requests = 0;
  const resolve = async (input: FilmCardInterface) => {
    requests++;
    return { ...input, info: 'Сезон 3 • серия 10 • завершён' };
  };
  const first = new BookmarkMetadataCache(store, resolve, () => 1001);
  assert.match((await first.resolve(card)).info!, /Сезон 3.*серия 10.*завершён/);
  const restarted = new BookmarkMetadataCache(store, resolve, () => 1002);
  assert.match((await restarted.resolve(card)).info!, /завершён/);
  assert.equal(requests, 1);
});

test('versioned anime metadata refresh clears stale pending status without waiting a week', async () => {
  const anime = { ...card, type: FilmType.ANIME, isPendingRelease: true };
  const entries = { [anime.link]: { updatedAt: 1000, card: anime, seriesInfoChecked: true,
    seriesInfoVersion: 1, animationSourceChecked: true, availabilityChecked: true } };
  const store = { load: <T>() => entries as T, save: () => true };
  let calls = 0;
  const cache = new BookmarkMetadataCache(store, async input => {
    calls++;
    return { ...input, isPendingRelease: false, info: 'Серия 8 · 8 / 12 серий · Выходит' };
  }, () => 1001);
  assert.equal((await cache.resolve(anime)).isPendingRelease, false);
  assert.match((await cache.resolve(anime)).info!, /Серия 8.*Выходит/);
  assert.equal(calls, 1);
});

test('missing episode metadata retries after six hours rather than every bookmark visit', async () => {
  let now = 1000, calls = 0;
  const store = { load: <T>() => null as T | null, save: () => true };
  const cache = new BookmarkMetadataCache(store, async input => {
    calls++;
    return calls === 1 ? input : { ...input, info: 'Серия 4 · Выходит' };
  }, () => now);
  await cache.resolve(card);
  now += 60 * 60 * 1000;
  await cache.resolve(card);
  assert.equal(calls, 1);
  now += 5 * 60 * 60 * 1000;
  assert.match((await cache.resolve(card)).info!, /Серия 4/);
  assert.equal(calls, 2);
});
test('current cached pending and incomplete status is rechecked after the status repair', async () => {
  const stale = { ...card, isPendingRelease: true, info: 'В ожидании' };
  const data = new Map<string, unknown>([['bookmark-metadata-v1', {
    [card.link]: { updatedAt: 1000, card: stale, metadataVersion: 6, sourceSelection: 'ANIXART,REZKA,ZONA',
      animationSourceChecked: true, seriesInfoChecked: true, seriesInfoVersion: 2,
      subtitleChecked: true, availabilityChecked: true, availabilityVersion: 2 },
  }]]);
  let calls = 0;
  const store = { load: <T>(key: string) => data.get(key) as T, save: (key: string, value: unknown) => { data.set(key, value); return true; } };
  const resolve = async (input: FilmCardInterface) => { calls++; return { ...input, isPendingRelease: false, info: 'Сезон 2 • серия 8 • завершён' }; };
  const first = new BookmarkMetadataCache(store, resolve, () => 1001);
  assert.equal((await first.resolve(card)).isPendingRelease, false);
  assert.match(first.peek(card).info!, /серия 8/);
  const restarted = new BookmarkMetadataCache(store, resolve, () => 1002);
  await restarted.resolve(card);
  assert.equal(calls, 1);
});

test('complete pending and ongoing bookmarks stay cached for a week without request spam', async () => {
  for (const status of [{ isPendingRelease: true, info: 'В ожидании' }, { isPendingRelease: false, info: 'Серия 3 · Выходит' }]) {
    let now = 1000, calls = 0;
    const store = { load: <T>() => null as T | null, save: () => true };
    const cache = new BookmarkMetadataCache(store, async input => { calls++; return { ...input, ...status }; }, () => now);
    await cache.resolve(card);
    now += 60 * 60 * 1000;
    await cache.resolve(card);
    assert.equal(calls, 1);
    now += 5 * 60 * 60 * 1000;
    await cache.resolve(card);
    assert.equal(calls, 1);
    now = 1000 + BOOKMARK_METADATA_TTL;
    await cache.resolve(card);
    assert.equal(calls, 2);
  }
});
test('bulk bookmark refresh coalesces full-cache disk writes and keeps fresh card identity', async () => {
  let writes = 0;
  const cache = new BookmarkMetadataCache({
    load: <T>() => null as T | null,
    save: () => { writes++; return true; },
  }, async card => ({ ...card, isEpisodic: false }));
  const cards = Array.from({ length: 300 }, (_, index) => ({
    ...card, link: 'bulk-' + index, type: FilmType.FILM,
  }));
  for (const item of cards) await cache.resolve(item);
  assert.ok(writes < 10, 'a burst must not serialize the entire cache per card');
  assert.equal(cache.peek(cards[0]), cache.peek(cards[0]));
  await new Promise(resolve => setTimeout(resolve, 300));
  assert.ok(writes >= 2, 'the last batch is persisted');
});
