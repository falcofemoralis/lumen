import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HomeCardCache, HOME_STATUS_TTL } from '../../src/source/search/HomeCardCache';
import { FilmType } from '../../src/type/FilmType.type';
test('Home restores posters and statuses across restart, refreshes after a day and keeps expired data visible', () => {
  const data = new Map<string, unknown>();
  const store = { load: <T>(key: string) => data.get(key) as T, save: (key: string, value: unknown) => { data.set(key, JSON.parse(JSON.stringify(value))); return true; } };
  let now = 1000;
  const card = { id: 'a', link: 'https://w1.zona.im/tvseries/a', type: FilmType.SERIES, poster: 'poster.jpg', title: 'A', subtitle: '2020' };
  const first = new HomeCardCache(store, () => now);
  first.remember(card, { ...card, info: 'Сезон 1 • серия 8 • завершён', ratings: { imdb: 8 }, isPendingRelease: false });
  first.rememberCatalog('series:', { films: [card], totalPages: 3 });
  const restart = new HomeCardCache(store, () => now);
  assert.equal(restart.catalog('series:')?.films[0].poster, 'poster.jpg');
  assert.match(restart.peek(card).info!, /серия 8/);
  assert.equal(restart.peek(card).ratings?.imdb, 8);
  assert.equal(restart.isFresh(card), true);
  now += HOME_STATUS_TTL;
  assert.equal(restart.isFresh(card), false);
  assert.match(restart.peek(card).info!, /завершён/);
});
test('a Zona series without episode status stays eligible for metadata refresh', () => {
  const data = new Map<string, unknown>();
  const cache = new HomeCardCache({
    load: <T>(key: string) => (data.get(key) ?? null) as T | null,
    save: (key, value) => { data.set(key, value); return true; },
  });
  const series = { id: 'status', title: 'Series', subtitle: '2020', poster: 'poster.jpg', type: FilmType.SERIES, link: 'https://w1.zona.im/tvseries/missing-status', info: undefined };
  cache.remember(series, series);
  assert.equal(cache.isFresh(series), false);
  cache.remember(series, { ...series, info: 'Сезон 2 • серия 8 • завершён' });
  assert.equal(cache.isFresh(series), true);
});
