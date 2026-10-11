import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ContentSource as Source } from '../../src/source/types/ContentSource';
import { setSourceSelection } from '../../src/source/types/SourceSelection';
import { SourceResolver } from '../../src/source/resolver/SourceResolver';
import { SourceRouter } from '../../src/source/resolver/SourceRouter';
import { createUnifiedSearchService } from '../../src/source/search/UnifiedSearchService';
import { BookmarkMetadataCache, BOOKMARK_METADATA_TTL } from '../../src/source/search/BookmarkMetadataCache';
import { FilmType } from 'Type/FilmType.type';
import { FilmInterface } from 'Type/Film.interface';
import { SourceAdapter } from '../../src/source/types/SourceAdapter';
import { UnifiedExternalIdType as Id } from '../../src/source/types/UnifiedFilm';

const film = (source: Source): FilmInterface => ({
  id: source, title: 'Exact match', type: FilmType.FILM, releaseDate: '2020', poster: 'poster',
  link: source === Source.ZONA ? 'https://w1.zona.im/movies/exact' : 'https://rezka.test/exact',
  voices: [], hasVoices: false, hasSeasons: false, externalIds: { kinopoisk: '4444' },
});
const adapter = (source: Source): SourceAdapter => {
  const own = film(source);
  const normalize = (value: FilmInterface) => ({
    id: value.id, title: value.title, type: value.type, year: Number(value.releaseDate),
    poster: value.poster, sources: [{ source, link: value.link, nativeId: value.id,
      externalIds: [{ type: Id.KINOPOISK, value: value.externalIds?.kinopoisk ?? '' }] }],
  });
  return { source, name: source, getFilm: async () => own, getExternalIds: () => [],
    search: async () => ({ films: [{ ...own, subtitle: '2020', ratings: undefined }], totalPages: 1 }),
    normalizeFilm: normalize, normalizeFilmCard: card => normalize({
      ...card, releaseDate: '2020', ratings: [], voices: [], hasVoices: false, hasSeasons: false,
    }) };
};
const restore = () => setSourceSelection(() => Object.values(Source));

test('disabled sources make no unified search requests; all unchecked yields an empty result', async () => {
  const zona = adapter(Source.ZONA), rezka = adapter(Source.REZKA);
  let zonaCalls = 0, rezkaCalls = 0;
  const zsearch = zona.search, rsearch = rezka.search;
  zona.search = (...args) => { zonaCalls++; return zsearch(...args); };
  rezka.search = (...args) => { rezkaCalls++; return rsearch(...args); };
  const service = createUnifiedSearchService([zona, rezka], new SourceResolver([zona, rezka]));
  try {
    setSourceSelection(() => [Source.ZONA]);
    assert.equal((await service.search('Exact match', 1)).films[0].link, film(Source.ZONA).link);
    assert.equal(zonaCalls, 1); assert.equal(rezkaCalls, 0);
    setSourceSelection(() => []);
    assert.deepEqual(await service.search('Exact match', 1), { films: [], totalPages: 1 });
  } finally { restore(); }
});

test('legacy disabled Rezka bookmark migrates using trusted stored identity without fetching Rezka', async () => {
  const zona = adapter(Source.ZONA), rezka = adapter(Source.REZKA);
  let requests = 0;
  rezka.getFilm = async () => { requests++; throw Error('disabled source must not be requested'); };
  const router = new SourceRouter([zona, rezka]);
  try {
    setSourceSelection(() => [Source.ZONA]);
    const old = { ...film(Source.REZKA), subtitle: '2020', ratings: undefined, id: 'library-id' };
    const result = await router.resolvePreferredCard(old, true);
    assert.equal(result.link, film(Source.ZONA).link);
    assert.equal(result.id, 'library-id');
    assert.equal(result.ratingSourceType, Source.ZONA);
    assert.equal(requests, 0);
  } finally { restore(); }
});

test('weekly bookmark refresh reuses its migrated native link rather than fetching the old source again', async () => {
  let now = 1000;
  const inputs: string[] = [];
  const old = { ...film(Source.REZKA), subtitle: '2020', ratings: undefined };
  const store = { load: <T>() => null as T | null, save: () => true };
  const cache = new BookmarkMetadataCache(store, async card => {
    inputs.push(card.link);
    return { ...card, link: film(Source.ZONA).link };
  }, () => now);
  await cache.resolve(old);
  now += BOOKMARK_METADATA_TTL;
  await cache.resolve(old);
  assert.deepEqual(inputs, [old.link, film(Source.ZONA).link]);
});