import assert from 'node:assert/strict';
import { test } from 'node:test';
import { homeCatalogLinks, createHomeCatalogLoader } from '../../src/source/search/HomeCatalog';
import { ContentSource } from '../../src/source/types/ContentSource';
import { SourceAdapter } from '../../src/source/types/SourceAdapter';
import { FilmType } from 'Type/FilmType.type';
import { createUnifiedSearchService } from '../../src/source/search/UnifiedSearchService';
import { SourceResolver } from '../../src/source/resolver/SourceResolver';
import { UnifiedExternalIdType } from '../../src/source/types/UnifiedFilm';
import { getRegisteredUnifiedFilm } from '../../src/source/search/UnifiedFilmRegistry';

test('five Home feeds route to native Zona and Anixart catalogs', () => {
  for (const tab of ['new', 'slider', 'soon', 'watching', 'popular']) {
    assert.equal(homeCatalogLinks(tab, ContentSource.ZONA).length, 2);
    assert.match(homeCatalogLinks(tab, ContentSource.ANIXART)[0], new RegExp('homeTab=' + tab));
  }
  assert.match(homeCatalogLinks('new', ContentSource.ZONA)[1], /updates\/tvseries/);
  assert.match(homeCatalogLinks('soon', ContentSource.ZONA)[0], /sort-year/);
});
const card = (link: string, pending = false) => ({
  id: link, link, title: 'Home release', subtitle: '2026', poster: link,
  type: FilmType.FILM, isPendingRelease: pending,
});
const adapter = (source: ContentSource): SourceAdapter => ({
  source, name: source, search: async () => ({ films: [], totalPages: 1 }),
  getFilm: async () => null, getExternalIds: () => [], normalizeFilm: () => { throw Error('unused'); },
  normalizeFilmCard: value => ({
    id: value.id, title: value.title, year: 2026, type: value.type, poster: value.poster,
    isPendingRelease: value.isPendingRelease,
    sources: [{ source, link: value.link, nativeId: value.id, externalIds: [{ type: UnifiedExternalIdType.KINOPOISK, value: '100' }] }],
  }),
});

test('Home catalog stops exhausted streams and keeps surviving Zona catalog on failure', async () => {
  const zona = adapter(ContentSource.ZONA);
  let requests = 0;
  zona.getFilms = async link => {
    requests++;
    if (link.includes('/tvseries')) throw Error('unavailable');
    return { films: [card(link)], totalPages: 1 };
  };
  const load = createHomeCatalogLoader();
  assert.equal((await load('popular', zona, 1)).films.length, 1);
  assert.equal((await load('popular', zona, 2)).films.length, 0);
  assert.equal(requests, 3, 'exhausted movies are not requested again; failed series may recover');
});
test('Home announcements exclude already available native cards', async () => {
  const anixart = adapter(ContentSource.ANIXART);
  anixart.getFilms = async () => ({ films: [card('released'), card('announced', true)], totalPages: 1 });
  const result = await createHomeCatalogLoader()('soon', anixart, 1);
  assert.deepEqual(result.films.map(value => value.link), ['announced']);
});
test('Home reuses unified deduplication and registers primary and supplemental sources', async () => {
  const zona = adapter(ContentSource.ZONA), rezka = adapter(ContentSource.REZKA);
  const service = createUnifiedSearchService([zona, rezka], new SourceResolver([zona, rezka]));
  const result = await service.search('home-test:popular', 1, undefined, {
    loadSource: async source => ({ films: [card(source.source)], totalPages: 1 }),
    prepareCard: async value => value,
  });
  assert.equal(result.films.length, 1);
  assert.equal(result.films[0].link, ContentSource.ZONA);
  assert.equal(getRegisteredUnifiedFilm(ContentSource.ZONA)?.sources.length, 2);
});
test('Home supplements stop requesting exhausted Rezka pages', async () => {
  const rezka = adapter(ContentSource.REZKA);
  const load = createHomeCatalogLoader();
  let requests = 0;
  const supplement = async () => { requests++; return { films: [card('rezka')], totalPages: 1 }; };
  await load('new', rezka, 1, supplement);
  await load('new', rezka, 2, supplement);
  assert.equal(requests, 1);
});

test('Zona updates stop after the first batch even when its page advertises more', async () => {
  const zona = adapter(ContentSource.ZONA);
  let requests = 0;
  zona.getFilms = async link => { requests++; return { films: [card(link)], totalPages: 2 }; };
  const load = createHomeCatalogLoader();
  assert.equal((await load('new', zona, 1)).totalPages, 1);
  assert.equal((await load('new', zona, 2)).films.length, 0);
  assert.equal(requests, 2);
});
test('Home publishes fast catalog cards while the additional catalog is still loading', async () => {
  const zona = adapter(ContentSource.ZONA);
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  zona.getFilms = async (link, _page, options) => {
    options?.onProgress?.({ films: [card(link + '/web')], totalPages: 2 });
    await gate;
    return { films: [card(link + '/web'), card(link + '/extra')], totalPages: 2 };
  };
  const snapshots: string[][] = [];
  const loading = createHomeCatalogLoader()('popular', zona, 1, undefined,
    result => snapshots.push(result.films.map(value => value.link)));
  assert.equal(snapshots.at(-1)?.length, 2, 'both catalogs appear before enrichment finishes');
  release();
  const result = await loading;
  assert.equal(result.films.length, 4);
  assert.equal(snapshots.at(-1)?.length, 4);
});

test('catalog progress preserves source restrictions and pagination deltas', async () => {
  const zona = adapter(ContentSource.ZONA), rezka = adapter(ContentSource.REZKA);
  let otherRequests = 0;
  rezka.search = async () => { otherRequests++; throw Error('should not request'); };
  const service = createUnifiedSearchService([zona, rezka], new SourceResolver([zona, rezka]));
  let progress = 0;
  const options = {
    sources: [ContentSource.ZONA],
    loadSource: async (_source: SourceAdapter, page: number, publish?: (result: { films: ReturnType<typeof card>[]; totalPages: number }) => void) => {
      publish?.({ films: [card('website')], totalPages: 2 });
      await new Promise(resolve => setTimeout(resolve, 5));
      return { films: [card('website'), card('desktop')], totalPages: 2 };
    },
    prepareCard: async (value: ReturnType<typeof card>) => value,
  };
  const first = await service.search('native-progress-delta', 1, undefined, options, () => { progress++; });
  assert.ok(progress > 0);
  assert.equal(first.films.length, 1, 'matching external IDs merge before display');
  const second = await service.search('native-progress-delta', 2, undefined, options);
  assert.equal(second.films.length, 0, 'a later occurrence does not append another card');
  assert.equal(otherRequests, 0);
});