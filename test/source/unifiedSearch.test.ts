import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FilmType } from 'Type/FilmType.type';
import { SourceResolver } from '../../src/source/resolver/SourceResolver';
import { createUnifiedSearchService } from '../../src/source/search/UnifiedSearchService';
import { getRegisteredUnifiedFilm } from '../../src/source/search/UnifiedFilmRegistry';
import { ContentSource } from '../../src/source/types/ContentSource';
import { UnifiedExternalIdType as Id, UnifiedFilm } from '../../src/source/types/UnifiedFilm';
import { SourceAdapter } from '../../src/source/types/SourceAdapter';

const film = (source: ContentSource, slug: string, kp?: string): UnifiedFilm => ({
  id: slug, title: 'Шрек', year: 2001, type: FilmType.CARTOON, poster: '',
  ratings: source === ContentSource.ZONA ? { imdb: 7.9 } : { kinopoisk: 8.2 },
  sources: [{ source, link: slug, nativeId: slug, externalIds: kp ? [{ type: Id.KINOPOISK, value: kp }] : [] }],
});
const adapter = (source: ContentSource, pages: UnifiedFilm[][]): SourceAdapter => ({
  source, name: source, getFilm: async () => null, getExternalIds: () => [],
  normalizeFilm: () => { throw Error('unused'); },
  normalizeFilmCard: (card) => pages.flat().find((item) => item.sources[0].link === card.link)!,
  search: async (_query, page) => ({
    films: (pages[page - 1] ?? []).map((item) => ({
      id: item.id, link: item.sources[0].link, title: item.title,
      subtitle: '2001', type: item.type, poster: '',
    })),
    totalPages: pages.length,
  }),
});
test('pagination returns deltas, updates the existing card and registers every source', async () => {
  const zona = adapter(ContentSource.ZONA, [[], [film(ContentSource.ZONA, 'zona', '430')]]);
  const rezka = adapter(ContentSource.REZKA, [[film(ContentSource.REZKA, 'rezka')], [
    film(ContentSource.REZKA, 'rezka'), { ...film(ContentSource.REZKA, 'new'), title: 'Другой фильм' },
  ]]);
  const service = createUnifiedSearchService([zona, rezka], new SourceResolver([zona, rezka]));
  const first = await service.search('delta', 1);
  assert.equal(first.films.length, 1);
  assert.equal(first.films[0].ratings?.kinopoisk, 8.2);
  let updated;
  const second = await service.search('delta', 2, (updates) => { updated = updates[0].card; });
  assert.equal(second.films.length, 1);
  assert.equal(second.films[0].title, 'Другой фильм');
  assert.equal(updated!.id, first.films[0].id);
  assert.equal(updated!.link, 'zona');
  assert.equal(updated!.ratings?.imdb, 7.9);
  assert.equal(getRegisteredUnifiedFilm('rezka')?.sources.length, 2);
  assert.equal((await service.search('delta', 1)).films.length, 1);
});
test('external IDs bridge types; conflicting IDs and different types without IDs stay separate', () => {
  const resolver = new SourceResolver([]);
  const zona = film(ContentSource.ZONA, 'zona', '430');
  const rezka = { ...film(ContentSource.REZKA, 'rezka', '430'), type: FilmType.FILM };
  assert.equal(resolver.deduplicate([zona, rezka]).length, 1);
  assert.equal(resolver.deduplicate([zona, film(ContentSource.REZKA, 'other', '999')]).length, 2);
  assert.equal(resolver.deduplicate([{ ...zona, sources: [{ ...zona.sources[0], externalIds: [] }] },
    { ...rezka, sources: [{ ...rezka.sources[0], externalIds: [] }] }]).length, 2);
});
test('undefined ratings do not erase values and native IDs survive merging', () => {
  const first = { ...film(ContentSource.ZONA, 'a'), ratings: { imdb: undefined } };
  const second = { ...film(ContentSource.REZKA, 'b'), ratings: { imdb: 7.9 } };
  assert.equal(new SourceResolver([]).deduplicate([first, second])[0].ratings?.imdb, 7.9);
});
test('a failing source does not suppress independent results', async () => {
  const zona = adapter(ContentSource.ZONA, []);
  zona.search = async () => { throw Error('offline'); };
  const rezka = adapter(ContentSource.REZKA, [[film(ContentSource.REZKA, 'only')]]);
  const service = createUnifiedSearchService([zona, rezka], new SourceResolver([zona, rezka]));
  assert.equal((await service.search('independent', 1)).films.length, 1);
});
test('matching original titles bridge localized names but retain year and type checks', () => {
  const first = { ...film(ContentSource.ZONA, 'original-a'), originalTitle: 'Shrek' };
  const second = { ...film(ContentSource.REZKA, 'original-b'), title: 'Shrek', originalTitle: 'Shrek' };
  const resolver = new SourceResolver([]);
  assert.equal(resolver.deduplicate([first, second]).length, 1);
  assert.equal(resolver.deduplicate([first, { ...second, year: 2002 }]).length, 2);
  assert.equal(resolver.deduplicate([first, { ...second, type: FilmType.SERIES }]).length, 2);
  assert.equal(resolver.deduplicate([first, { ...second, title: first.title, originalTitle: 'Different work' }]).length, 2);
});
test('filtered source pages deduplicate before display and preserve pagination deltas', async () => {
  const z = adapter(ContentSource.ZONA, [[film(ContentSource.ZONA, 'filter-z')], []]);
  const r = adapter(ContentSource.REZKA, [[film(ContentSource.REZKA, 'filter-r')],
    [film(ContentSource.REZKA, 'filter-r'), { ...film(ContentSource.REZKA, 'filter-new'), title: 'Другое' }]]);
  const service = createUnifiedSearchService([z, r], new SourceResolver([z, r]));
  const options = {
    loadSource: (source: SourceAdapter, page: number) => source.search('ignored', page),
    prepareCard: async (card: any) => card.title === 'Другое' ? null : card,
  };
  assert.equal((await service.search('filter-case', 1, undefined, options)).films.length, 1);
  assert.equal((await service.search('filter-case', 2, undefined, options)).films.length, 0);
});
test('one failed metadata request does not discard the other cards of that source', async () => {
  const r = adapter(ContentSource.REZKA, [[film(ContentSource.REZKA, 'bad'), { ...film(ContentSource.REZKA, 'good'), title: 'Другое' }]]);
  const service = createUnifiedSearchService([r], new SourceResolver([r]));
  const result = await service.search('partial-metadata', 1, undefined, {
    loadSource: (source, page) => source.search('ignored', page),
    prepareCard: async (card) => { if (card.link === 'bad') throw Error('offline'); return card; },
  });
  assert.equal(result.films.length, 1);
  assert.equal(result.films[0].title, 'Другое');
});test('fast source results are published while another source is waiting; final result still deduplicates', async () => {
  const z = adapter(ContentSource.ZONA, [[film(ContentSource.ZONA, 'progress-zona', '430')]]);
  const r = adapter(ContentSource.REZKA, [[film(ContentSource.REZKA, 'progress-rezka', '430')]]);
  const search = z.search;
  let release!: () => void;
  const waiting = new Promise<void>((resolve) => { release = resolve; });
  z.search = async (...args) => { await waiting; return search(...args); };
  const service = createUnifiedSearchService([z, r], new SourceResolver([z, r]));
  let first!: () => void;
  const firstProgress = new Promise<void>((resolve) => { first = resolve; });
  const pending = service.search('progress-test', 1, undefined, undefined, (result) => {
    if (result.films[0]?.link === 'progress-rezka') first();
  });
  await firstProgress;
  release();
  const result = await pending;
  assert.equal(result.films.length, 1);
  assert.equal(result.films[0].link, 'progress-zona');
  assert.equal(getRegisteredUnifiedFilm('progress-rezka')?.sources.length, 2);
});

test('search verifies different localized subtitles using detail IDs without merging unrelated titles', async () => {
  const zFilm = { ...film(ContentSource.ZONA, 'variant-z', '5610132'), title: 'Вышка 2', originalTitle: 'Fall 2: Deadpoint', year: 2026, type: FilmType.FILM };
  const rFilm = { ...film(ContentSource.REZKA, 'variant-r'), title: 'Вышка 2: Мёртвая зона', year: 2026, type: FilmType.FILM };
  const z = adapter(ContentSource.ZONA, [[zFilm]]), r = adapter(ContentSource.REZKA, [[rFilm]]);
  let requests = 0;
  r.getFilm = async () => { requests++; return { id: 'variant-r', link: 'variant-r', title: rFilm.title, poster: '', type: FilmType.FILM, voices: [], hasSeasons: false, hasVoices: false }; };
  r.normalizeFilm = () => ({ ...rFilm, originalTitle: 'Fall 2: Deadpoint', sources: [{ ...rFilm.sources[0], externalIds: [{ type: Id.KINOPOISK, value: '5610132' }] }] });
  const service = createUnifiedSearchService([z, r], new SourceResolver([z, r]));
  const result = await service.search('subtitle-verification', 1);
  assert.equal(result.films.length, 1);
  assert.equal(result.films[0].link, 'variant-z');
  assert.equal(result.films[0].externalIds?.kinopoisk, '5610132');
  assert.equal(requests, 1);
  assert.equal(getRegisteredUnifiedFilm('variant-r')?.sources.length, 2);
  r.normalizeFilm = () => ({ ...rFilm, originalTitle: 'Other movie', sources: [{ ...rFilm.sources[0], externalIds: [{ type: Id.KINOPOISK, value: '999' }] }] });
  // Use fresh rows, since normalization returns mutable fixture objects.
  zFilm.sources = [{ ...zFilm.sources[0], externalIds: [{ type: Id.KINOPOISK, value: '5610132' }] }];
  rFilm.originalTitle = undefined;
  rFilm.sources = [{ source: ContentSource.REZKA, link: 'variant-r', nativeId: 'variant-r', externalIds: [] }];
  assert.equal((await service.search('subtitle-conflict', 1)).films.length, 2);
});
