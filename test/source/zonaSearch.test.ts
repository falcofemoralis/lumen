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
    assert.deepEqual(film.ratings, { imdb: 7.9, kinopoisk: 8.2 });
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
