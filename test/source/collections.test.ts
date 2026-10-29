import { test } from 'node:test';
import assert from 'node:assert/strict';
import Zona from '../../src/source/adapters/ZonaSourceAdapter';
import Anixart from '../../src/source/adapters/AnixartSourceAdapter';
import { createUnifiedCollectionsService } from '../../src/source/search/UnifiedCollectionsService';
import { SourceAdapter } from '../../src/source/types/SourceAdapter';
import { ContentSource } from '../../src/source/types/ContentSource';
import { setSourceSelection } from '../../src/source/types/SourceSelection';
import { FilmType } from '../../src/type/FilmType.type';

const adapter = (source: ContentSource, pages: number): SourceAdapter => ({
  source, name: source, getFilm: async () => null, getExternalIds: () => [],
  search: async () => ({ films: [], totalPages: 1 }), normalizeFilm: () => { throw Error('unused'); }, normalizeFilmCard: () => { throw Error('unused'); },
  getCollections: async page => ({ items: [{ id: 'same', title: 'Same title', image: '', url: source + '/' + page, amount: 1 }], totalPages: pages }),
});
test('collection ordering, source links and independent page limits survive a failing provider', async () => {
  const z = adapter(ContentSource.ZONA, 1), a = adapter(ContentSource.ANIXART, 2), r = adapter(ContentSource.REZKA, 3);
  const service = createUnifiedCollectionsService([r, a, z]);
  const first = await service.getCollections(1);
  assert.deepEqual(first.items.map(item => item.source), [ContentSource.ZONA, ContentSource.ANIXART, ContentSource.REZKA]);
  assert.equal(new Set(first.items.map(item => item.id)).size, 3);
  assert.equal(first.totalPages, 3);
  const second = await service.getCollections(2);
  assert.deepEqual(second.items.map(item => item.url), [ContentSource.ANIXART + '/2', ContentSource.REZKA + '/2']);
  r.getCollections = async () => { throw new Error('blocked'); };
  assert.equal((await service.getCollections(1)).items.length, 2);
  setSourceSelection(() => [ContentSource.ANIXART]);
  try { assert.deepEqual((await service.getCollections(1)).items.map(item => item.source), [ContentSource.ANIXART]); }
  finally { setSourceSelection(() => [ContentSource.ZONA, ContentSource.ANIXART, ContentSource.REZKA]); }
});
test('native collections appear before a slow Rezka request finishes', async () => {
  const z = adapter(ContentSource.ZONA, 1), r = adapter(ContentSource.REZKA, 1);
  let finish!: () => void;
  const waiting = new Promise<void>(resolve => { finish = resolve; });
  const read = r.getCollections!;
  r.getCollections = async page => { await waiting; return read(page); };
  const service = createUnifiedCollectionsService([r, z]);
  let progress = 0;
  const pending = service.getCollections(1, page => { progress = page.items.length; });
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(progress, 1);
  finish();
  assert.equal((await pending).items.length, 2);
});
test('Zona public collections preserve image URLs and mixed content uses native movie/series paths', async () => {
  Object.assign(globalThis, { __DEV__: false });
  const saved = globalThis.fetch;
  globalThis.fetch = async input => {
    if (String(input).endsWith('/collections')) return new Response('<a title="Подборка" href="/collections/test"><img src="/_next/image?url=https%3A%2F%2Fimg.test%2Fc.jpg&amp;w=500"></a>');
    const record = { data: [
      { slug: 'movie', title: 'Movie', year: 2000, type: 'movie', cover_url: 'https://img.test/movie.jpg' },
      { slug: 'series', title: 'Series', year: 2001, type: 'series', cover_url: 'https://img.test/series.jpg' },
    ], collectionSlug: 'test', initialPage: 1, isSecondPage: false };
    return new Response('<script>self.__next_f.push([1,' + JSON.stringify('5:' + JSON.stringify(record)) + '])</script>');
  };
  try {
    const page = await Zona.getCollections!(1);
    assert.equal(page.items[0].image, 'https://img.test/c.jpg');
    assert.equal((await Zona.getCollections!(2)).items.length, 0);
    const content = await Zona.getFilms!(page.items[0].url, 1, { deferMetadata: true });
    assert.deepEqual(content.films.map(film => film.type), [FilmType.FILM, FilmType.SERIES]);
    assert.ok(content.films[1].link.includes('/tvseries/'));
  } finally { globalThis.fetch = saved; }
});
test('Anixart collections use native release paging and omit deleted/private collections', async () => {
  const saved = globalThis.fetch;
  const paths: string[] = [];
  globalThis.fetch = async input => {
    paths.push(String(input));
    return String(input).includes('/collection/all/')
      ? Response.json({ code: 0, content: [{ id: 987600, title: 'Collection', image: 'image' }, { id: 987601, title: 'Private', is_private: true }], total_page_count: 3 })
      : Response.json({ code: 0, content: [{ id: 987699, title_ru: 'Anime', image: 'poster', country: 'Япония' }], total_page_count: 2 });
  };
  try {
    const list = await Anixart.getCollections!(2);
    assert.equal(list.items.length, 1);
    assert.equal(list.totalPages, 3);
    assert.ok(paths[0].includes('/collection/all/1'));
    assert.equal((await Anixart.getFilms!(list.items[0].url, 2)).films[0].id, 'ANIXART:987699');
    assert.ok(paths[1].endsWith('/collection/987600/releases/1'));
  } finally { globalThis.fetch = saved; }
});
