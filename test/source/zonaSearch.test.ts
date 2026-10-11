import assert from 'node:assert/strict';
import { test } from 'node:test';
import Zona from '../../src/source/adapters/ZonaSourceAdapter';
import { FilmType } from 'Type/FilmType.type';
import { UnifiedExternalIdType } from '../../src/source/types/UnifiedFilm';

test('Zona enriches search with genre, KP ID and external ratings without extra requests', async () => {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  Object.assign(globalThis, { __DEV__: false });
  const data = {
    slug: 'shrek', title: 'Шрек', title_original: 'Shrek', year: 2001,
    rating: 8.05, rating_kp: 8.2, rating_imdb: 7.9, kp_id: 430,
    meta: { tags: [{ slug: 'multfilm', title: 'мультфильм', type: 'genre' }] },
  };
  const script = (payload: string) => '<script>self.__next_f.push([1,' + JSON.stringify(payload) + '])</script>';
  let requests = 0;
  globalThis.fetch = async (url) => {
    requests += 1;
    return new Response(script(String(url).includes('/search/')
      ? '6:' + JSON.stringify(['$', 'Component', null, { data: [{ slug: 'shrek', title: 'Шрек', year: 2001, type: 'movie' }], query: 'Шрек', params: {} }])
      : '6:' + JSON.stringify({ data, entityType: 'movie' })));
  };
  try {
    const result = await Zona.search('Шрек', 1);
    const film = Zona.normalizeFilmCard(result.films[0]);
    assert.equal(film.type, FilmType.CARTOON);
    assert.equal(film.originalTitle, 'Shrek');
    assert.equal(film.subtitle, '2001, мультфильм');
    assert.deepEqual(film.ratings, { imdb: 7.9, kinopoisk: 8.2, imdbPending: false });
    assert.deepEqual(film.sources[0].externalIds, [{ type: UnifiedExternalIdType.KINOPOISK, value: '430' }]);
    assert.equal(requests, 2);
    assert.equal((await Zona.search('Шрек', 2)).films.length, 0);
    assert.equal(requests, 2);
    await Zona.search('Шрек', 1);
    assert.equal(requests, 3, 'repeat search reuses detail metadata');
    now += 6 * 60 * 1000;
    data.meta.tags = [{ slug: 'anime', title: 'аниме', type: 'genre' }];
    assert.equal((await Zona.search('Шрек', 1)).films[0].type, FilmType.ANIME);
    now += 6 * 60 * 1000;
    data.meta.tags = [];
    assert.equal((await Zona.search('Шрек', 1)).films[0].type, FilmType.FILM);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
});test('Zona candidate matching loads only search page until identity verification requests details', async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    return new Response('<script>self.__next_f.push([1,' + JSON.stringify('5:' + JSON.stringify(
      ['$', 'Component', null, { data: [{ slug: 'candidate-only', title: 'Film', year: 2020, type: 'movie' }], query: 'Film' }]
    )) + '])</script>');
  };
  try {
    assert.equal((await Zona.searchCandidates!('Film', 1)).films.length, 1);
    assert.equal(requests, 1);
  } finally { globalThis.fetch = originalFetch; }
});


test('Zona clears pending only when metadata confirms uploaded media or quality', async () => {
  const originalFetch = globalThis.fetch;
  Object.assign(globalThis, { __DEV__: false });
  globalThis.fetch = async (url) => {
    const slug = String(url).split('/').pop()!;
    const data = { slug, title: 'Availability', meta: { media_id: slug === 'available-media' ? 123 : null },
      best_quality: slug === 'available-quality' ? '1080p' : undefined };
    return new Response('<script>self.__next_f.push([1,' + JSON.stringify('6:' + JSON.stringify({ data, entityType: 'movie' })) + '])</script>');
  };
  try {
    assert.equal((await Zona.getFilm('https://w1.zona.im/movies/available-media'))?.isPendingRelease, false);
    assert.equal((await Zona.getFilm('https://w1.zona.im/movies/available-quality'))?.isPendingRelease, false);
    assert.equal((await Zona.getFilm('https://w1.zona.im/movies/unknown-availability'))?.isPendingRelease, undefined);
  } finally { globalThis.fetch = originalFetch; }
});

test('Zona publishes search cards and ready ratings while another detail request is still pending', async () => {
  const saved = globalThis.fetch;
  Object.assign(globalThis, { __DEV__: false });
  let releaseSlow!: () => void;
  const slow = new Promise<void>(resolve => { releaseSlow = resolve; });
  let reportReady!: (value: { films: import('Type/FilmCard.interface').FilmCardInterface[] }) => void;
  const ready = new Promise<{ films: import('Type/FilmCard.interface').FilmCardInterface[] }>(resolve => { reportReady = resolve; });
  const script = (payload: string) => '<script>self.__next_f.push([1,' + JSON.stringify(payload) + '])</script>';
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.includes('/search/')) return new Response(script('6:' + JSON.stringify(['$', 'Component', null, {
      data: ['progress-fast', 'progress-slow'].map(slug => ({ slug, title: slug, year: 2020, type: 'movie' })), query: 'progress', params: {},
    }])));
    if (url.includes('progress-slow')) await slow;
    return new Response(script('6:' + JSON.stringify({ entityType: 'movie', data: {
      slug: url.split('/').pop(), title: 'progress', year: 2020, rating_imdb: 7.6,
    } })));
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const task = Zona.search('progress', 1, { onProgress: value => {
      if (value.films[0]?.ratings?.imdb === 7.6) reportReady(value);
    } });
    const partial = await Promise.race([ready, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(Error('ready card waited for slow metadata')), 2000);
    })]);
    assert.equal(partial.films.length, 2);
    assert.equal(partial.films[1].ratings?.imdbPending, true);
    releaseSlow();
    assert.equal((await task).films[1].ratings?.imdb, 7.6);
  } finally { releaseSlow(); clearTimeout(timer); globalThis.fetch = saved; }
});