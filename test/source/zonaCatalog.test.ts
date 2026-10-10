import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FilmType } from 'Type/FilmType.type';
import Zona, { getZonaCatalogFilms } from '../../src/source/adapters/ZonaSourceAdapter';

const data = {
  slug: 'shrek', title: 'Шрек', title_original: 'Shrek', year: 2001,
  rating: 8.05, rating_count: 1770572, rating_kp: 8.2, rating_imdb: 7.9, kp_id: 430,
  meta: { tags: [
    { slug: 'multfilm', title: 'мультфильм', type: 'genre' },
    { slug: 'ssha', title: 'США', type: 'country' },
  ] },
};
const script = (payload: string) => '<script>self.__next_f.push([1,' + JSON.stringify(payload) + '])</script>';
test('catalog decodes nested multi-record RSC and returns the requested page and external ratings', async () => {
  const originalFetch = globalThis.fetch;
  Object.assign(globalThis, { __DEV__: false });
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    requests.push(String(input));
    const page = Number(new URL(String(input)).searchParams.get('page'));
    return new Response(script('1:{"unused":true}\n5:' + JSON.stringify([
      ['$', 'Component', null, { entities: [{ ...data, slug: 'shrek-' + page }], isNextPage: page === 1, initialPage: page }],
    ]) + '\n'));
  };
  try {
    const first = await getZonaCatalogFilms('https://w1.zona.im/movies/filter/genre-multfilm', 1);
    const second = await getZonaCatalogFilms('https://w1.zona.im/movies/filter/genre-multfilm', 2);
    assert.equal(first.totalPages, 2);
    assert.equal(second.totalPages, 2);
    assert.notEqual(first.films[0].link, second.films[0].link);
    assert.equal(second.films[0].type, FilmType.CARTOON);
    assert.deepEqual(second.films[0].ratings, { imdb: 7.9, kinopoisk: 8.2 });
    assert.equal(second.films[0].externalIds?.kinopoisk, '430');
    assert.match(requests[1], /page=2/);
  } finally { globalThis.fetch = originalFetch; }
});
test('film links use native genre/country filters; external vote counts stay unknown', async () => {
  const originalFetch = globalThis.fetch;
  Object.assign(globalThis, { __DEV__: false });
  globalThis.fetch = async () => new Response(script('6:' + JSON.stringify({ data, entityType: 'movie' })));
  try {
    const film = await Zona.getFilm('https://w1.zona.im/movies/shrek');
    assert.equal(film?.genres?.[0].link, 'https://w1.zona.im/movies/filter/genre-multfilm');
    assert.equal(film?.countries?.[0].link, 'https://w1.zona.im/movies/filter/country-ssha');
    assert.equal(film?.ratings?.[0].votes, undefined);
    assert.equal(film?.mainRating?.name, 'Zona');
    assert.equal(film?.mainRating?.votes, 1770572);
    assert.deepEqual(await Zona.getFilmRatings!('https://w1.zona.im/movies/shrek'), { imdb: 7.9, kinopoisk: 8.2 });
  } finally { globalThis.fetch = originalFetch; }
});
test('unexpected catalog page is rejected instead of appending duplicate cards', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(script('5:' + JSON.stringify({ entities: [data], initialPage: 1 })));
  try {
    await assert.rejects(getZonaCatalogFilms('https://w1.zona.im/movies', 2), /different catalog page/);
  } finally { globalThis.fetch = originalFetch; }
});
test('catalog cards without genres fetch detail metadata, classify cartoons and preserve year-only films', async () => {
  const originalFetch = globalThis.fetch;
  const slug = 'catalog-without-tags';
  Object.assign(globalThis, { __DEV__: false });
  let requests = 0;
  globalThis.fetch = async (input) => {
    requests++;
    return new Response(String(input).includes('/filter/') ? script('5:' + JSON.stringify({
      entities: [{ ...data, slug, meta: undefined }], initialPage: 1,
    })) : script('a:' + JSON.stringify({ data: { ...data, slug }, entityType: 'movie' })));
  };
  try {
    const result = await getZonaCatalogFilms('https://w1.zona.im/movies/filter/country-ssha', 1);
    assert.equal(result.films[0].type, FilmType.CARTOON);
    assert.equal(requests, 2);
    const details = await Zona.getFilm(result.films[0].link);
    assert.equal(details?.releaseDate, '2001');
    assert.equal(Zona.normalizeFilm(details!).year, 2001);
    assert.equal(requests, 2);
  } finally { globalThis.fetch = originalFetch; }
});test('Home deferred metadata returns after one catalog request and enriches type separately', async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async (input) => {
    requests++;
    return new Response(new URL(String(input)).pathname === '/movies' ? script('5:' + JSON.stringify({
      entities: [{ ...data, slug: 'deferred-home', meta: undefined }], initialPage: 1,
    })) : script('a:' + JSON.stringify({ data: { ...data, slug: 'deferred-home' }, entityType: 'movie' })));
  };
  try {
    const catalog = await getZonaCatalogFilms('https://w1.zona.im/movies', 1, { deferMetadata: true });
    assert.equal(requests, 1);
    assert.equal(catalog.films[0].contentTypePending, true);
    assert.equal(catalog.films[0].ratings?.imdbPending, true);
    assert.equal((await Zona.getFilm(catalog.films[0].link))?.type, FilmType.CARTOON);
    assert.equal(requests, 2);
  } finally { globalThis.fetch = originalFetch; }
});

test('deferred series metadata classifies the poster before any season request', async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    return new Response(script('a:' + JSON.stringify({ data: { ...data, slug: 'fast-series', meta: { tags: [{ slug: 'drama', title: 'Драма', type: 'genre' }] }, seasons: [{ slug: 'season-1', part: 1, is_banned: false, episode_count: 8 }] }, entityType: 'series' })));
  };
  try {
    const film = await Zona.getFilm('https://w1.zona.im/tvseries/fast-series', { deferSeriesInfo: true });
    assert.equal(film?.type, FilmType.SERIES);
    assert.equal(requests, 1);
    await Zona.getFilm('https://w1.zona.im/tvseries/fast-series');
    assert.equal(requests, 2);
  } finally { globalThis.fetch = originalFetch; }
});