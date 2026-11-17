import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FilmType } from '../../src/type/FilmType.type';
import type { FilmCardInterface } from '../../src/type/FilmCard.interface';
import type { LocalBookmarksBlob } from '../../src/type/LocalLibrary.interface';
import { bookmarksForFilm, toggleBookmark } from '../../src/util/LocalLibrary/logic';
import { matchingBookmarkIds } from '../../src/util/LocalLibrary/identity';
import { cachedRemoteBookmarks, mergeBookmarkFlags } from '../../src/util/LocalLibrary/remoteBookmarks';

const old: FilmCardInterface = { id: '123', link: 'https://hdrezka.ag/films/123-tower.html', type: FilmType.FILM,
  title: 'Вышка 2: Мёртвая зона', subtitle: '2026, США', poster: '', externalIds: { imdb: 'tt1234567' } };
const current: FilmCardInterface = { ...old, id: 'EXTERNAL:IMDB:tt1234567', link: 'https://w140.zona.im/movies/tower-2',
  title: 'Вышка 2', ratingSourceType: 'ZONA' as never };
const library = (): LocalBookmarksBlob => ({ categories: [
  { id: 'folder1', title: 'First', filmIds: ['123'], createdAt: 0 },
  { id: 'folder2', title: 'Second', filmIds: ['123'], createdAt: 0 },
], films: { '123': old } });

test('Unified search cards recognise old native bookmarks in every folder and preserve their stable ID', () => {
  const blob = library();
  assert.deepEqual(matchingBookmarkIds(blob, current), ['123']);
  assert.equal(bookmarksForFilm(blob, current.id, current).filter(item => item.isBookmarked).length, 2);
  const updated = toggleBookmark(blob, current, 'folder1', true);
  assert.deepEqual(updated.categories.map(item => item.filmIds), [['123'], ['123']]);
  assert.equal(updated.films['123'].id, '123');
  assert.equal(updated.films['123'].link, current.link);
  assert.equal(new Set(updated.films['123'].sources?.map(source => source.source)).size, 2);
  const removed = toggleBookmark(updated, current, 'folder1', false);
  assert.deepEqual(removed.categories.map(item => item.filmIds), [[], ['123']]);
  assert.ok(removed.films['123']);
  assert.deepEqual(blob.categories[0].filmIds, ['123'], 'source state is unchanged');
});

test('Native provider links match across Rezka mirrors without external IDs', () => {
  const card = { ...old, externalIds: undefined };
  const blob = { ...library(), films: { '123': card } };
  assert.deepEqual(matchingBookmarkIds(blob, { ...card, id: 'CONTENT:FILM:2026:tower', link: 'https://rezka.example/films/123-tower.html' }), ['123']);
});

test('Conflicting external IDs and different works must not mark a poster bookmarked', () => {
  const blob = library();
  assert.deepEqual(matchingBookmarkIds(blob, { ...current, id: old.id, externalIds: { imdb: 'tt9999999' } }), []);
  assert.equal(bookmarksForFilm(blob, old.id, { ...current, id: old.id, externalIds: { imdb: 'tt9999999' } })[0].isBookmarked, false);
  assert.deepEqual(matchingBookmarkIds(blob, { ...current, id: 'different', title: 'Вышка', externalIds: undefined }), []);
  assert.deepEqual(matchingBookmarkIds(blob, { ...current, id: 'different', title: 'Вышка 2: Мёртвая зона', subtitle: '2019', externalIds: undefined }), []);
});

test('Legacy anime bookmarks recognise new Anixart cards by exact title, year and type', () => {
  const anime: FilmCardInterface = { ...old, id: '345', title: 'Милый дом Чи', type: FilmType.ANIME, subtitle: '2008', externalIds: undefined };
  const blob = { ...library(), films: { '345': anime }, categories: [{ id: 'anime', title: 'Anime', filmIds: ['345'], createdAt: 0 }] };
  const newAnime: FilmCardInterface = { ...anime, id: 'ANIXART:1', link: 'https://anixart-app.com/release/1' };
  assert.deepEqual(matchingBookmarkIds(blob, newAnime), ['345']);
  assert.equal(toggleBookmark(blob, newAnime, 'anime', true).categories[0].filmIds.length, 1);
});

test('Cached remote folders provide the same membership matching without another network request', () => {
  const blob = cachedRemoteBookmarks([{ id: 'a', title: 'Old', filmList: { films: [old], totalPages: 1 } }],
    [{ categoryId: 'b', films: [old] }]);
  assert.equal(bookmarksForFilm(blob, current.id, current).filter(item => item.isBookmarked).length, 2);
  assert.equal(mergeBookmarkFlags([{ id: 'a', title: 'Old', isBookmarked: false }], bookmarksForFilm(blob, current.id, current))[0].isBookmarked, true);
});
