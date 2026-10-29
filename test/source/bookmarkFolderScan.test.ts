import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scanBookmarkFolders, BookmarkFolderPage } from '../../src/source/search/BookmarkFolderScan';
import { FilmType } from '../../src/type/FilmType.type';
const card = (id: string) => ({ id, link: id, title: id, poster: id, subtitle: '2020', type: FilmType.SERIES });
test('remote bookmark scan loads all folders and pages fairly without opening their tabs', async () => {
  const pages = new Map<string, BookmarkFolderPage>();
  const requests: string[] = [];
  await scanBookmarkFolders([{ id: 'first', title: 'First', filmList: { films: [card('a')], totalPages: 2 } }, { id: 'second', title: 'Second' }],
    id => pages.get(id), (id, data) => { pages.set(id, data); }, async (bookmark, page) => {
      requests.push(bookmark.id + ':' + page);
      return { films: bookmark.id === 'first' ? [card('a'), card('b')] : [card('second-' + page)], totalPages: bookmark.id === 'first' ? 2 : 3 };
    });
  assert.deepEqual(requests, ['second:1', 'first:2', 'second:2', 'second:3']);
  assert.deepEqual(pages.get('first')?.films.map(card => card.id), ['a', 'b']);
  assert.equal(pages.get('second')?.films.length, 3);
  assert.equal(pages.get('second')?.currentPage, 3);
});
test('one failed folder does not prevent other folders from being scanned', async () => {
  const pages = new Map<string, BookmarkFolderPage>();
  await assert.rejects(scanBookmarkFolders([{ id: 'bad', title: 'Bad' }, { id: 'good', title: 'Good' }],
    id => pages.get(id), (id, data) => { pages.set(id, data); }, async bookmark => {
      if (bookmark.id === 'bad') throw new Error('offline');
      return { films: [card('good')], totalPages: 1 };
    }), /offline/);
  assert.equal(pages.get('good')?.films[0].id, 'good');
});