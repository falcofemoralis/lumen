import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { LocalBookmarksBlob, LocalHistoryItemInterface } from 'Type/LocalLibrary.interface';
import {
  addCategory,
  bookmarksForFilm,
  dedupeUpdateItems,
  emptyBookmarksBlob,
  extractEpisodeKey,
  extractVoiceFromInfo,
  filmsForCategory,
  filterUpdatesForLocalLibrary,
  MAX_LOCAL_HISTORY_ITEMS,
  normalizeFilmLink,
  normalizeVoiceTitle,
  parseBookmarksBlob,
  parseHistoryList,
  parseScheduleMarks,
  removeCategory,
  removeHistoryItem,
  setHistoryWatched,
  setScheduleMark,
  toggleBookmark,
  upsertHistoryItem,
  validateNewCategoryTitle,
} from 'Util/LocalLibrary/logic';

const filmCard = (id: string): FilmCardInterface => ({
  id,
  link: `/films/${id}`,
  type: FilmType.Film,
  poster: `poster-${id}.jpg`,
  title: `Film ${id}`,
  subtitle: '2026',
});

const historyItem = (id: string, updatedAt = 0): LocalHistoryItemInterface => ({
  id,
  link: `/films/${id}`,
  poster: `poster-${id}.jpg`,
  title: `Film ${id}`,
  updatedAt,
  isWatched: false,
});

const blobWithCategories = (...titles: string[]): LocalBookmarksBlob => titles.reduce(
  (blob, title, index) => addCategory(blob, {
    id: `cat${index + 1}`,
    title,
    filmIds: [],
    createdAt: index,
  }),
  emptyBookmarksBlob()
);

test('parseBookmarksBlob falls back to empty blob on invalid input', () => {
  assert.deepEqual(parseBookmarksBlob(null), { categories: [], films: {} });
  assert.deepEqual(parseBookmarksBlob('not json'), { categories: [], films: {} });
  assert.deepEqual(parseBookmarksBlob('"a string"'), { categories: [], films: {} });
  assert.deepEqual(parseBookmarksBlob('{"categories": {}}'), { categories: [], films: {} });
});

test('parseHistoryList and parseScheduleMarks fall back on invalid input', () => {
  assert.deepEqual(parseHistoryList('{"a":1}'), []);
  assert.deepEqual(parseHistoryList(undefined), []);
  assert.deepEqual(parseScheduleMarks('[1,2]'), {});
  assert.deepEqual(parseScheduleMarks(null), {});
});

test('validateNewCategoryTitle rejects blank and duplicate titles', () => {
  const blob = blobWithCategories('Favorites');

  assert.equal(validateNewCategoryTitle(blob, '   '), 'empty');
  assert.equal(validateNewCategoryTitle(blob, 'Favorites'), 'exists');
  assert.equal(validateNewCategoryTitle(blob, '  Favorites  '), 'exists');
  assert.equal(validateNewCategoryTitle(blob, 'Watch later'), null);
});

test('toggleBookmark adds film to one category without affecting others', () => {
  const blob = blobWithCategories('Favorites', 'Watch later');
  const toggled = toggleBookmark(blob, filmCard('f1'), 'cat1', true);

  assert.deepEqual(toggled.categories[0].filmIds, ['f1']);
  assert.deepEqual(toggled.categories[1].filmIds, []);
  assert.deepEqual(toggled.films.f1, filmCard('f1'));
  assert.deepEqual(bookmarksForFilm(toggled, 'f1'), [
    { id: 'cat1', title: 'Favorites', isBookmarked: true },
    { id: 'cat2', title: 'Watch later', isBookmarked: false },
  ]);
});

test('toggleBookmark keeps the film card while another category still references it', () => {
  let blob = blobWithCategories('Favorites', 'Watch later');

  blob = toggleBookmark(blob, filmCard('f1'), 'cat1', true);
  blob = toggleBookmark(blob, filmCard('f1'), 'cat2', true);
  blob = toggleBookmark(blob, filmCard('f1'), 'cat1', false);

  assert.deepEqual(blob.categories[0].filmIds, []);
  assert.deepEqual(blob.categories[1].filmIds, ['f1']);
  assert.ok(blob.films.f1, 'film card must remain while cat2 references it');

  blob = toggleBookmark(blob, filmCard('f1'), 'cat2', false);
  assert.equal(blob.films.f1, undefined, 'film card must be garbage-collected on last removal');
});

test('toggleBookmark is a no-op for a missing category', () => {
  const blob = blobWithCategories('Favorites');
  const toggled = toggleBookmark(blob, filmCard('f1'), 'ghost', true);

  assert.deepEqual(toggled, blob);
});

test('toggleBookmark puts re-added films first and does not duplicate', () => {
  let blob = blobWithCategories('Favorites');

  blob = toggleBookmark(blob, filmCard('f1'), 'cat1', true);
  blob = toggleBookmark(blob, filmCard('f2'), 'cat1', true);
  blob = toggleBookmark(blob, filmCard('f1'), 'cat1', true);

  assert.deepEqual(blob.categories[0].filmIds, ['f1', 'f2']);
});

test('removeCategory garbage-collects films only it referenced', () => {
  let blob = blobWithCategories('Favorites', 'Watch later');

  blob = toggleBookmark(blob, filmCard('f1'), 'cat1', true);
  blob = toggleBookmark(blob, filmCard('f2'), 'cat1', true);
  blob = toggleBookmark(blob, filmCard('f2'), 'cat2', true);

  blob = removeCategory(blob, 'cat1');

  assert.equal(blob.categories.length, 1);
  assert.equal(blob.films.f1, undefined);
  assert.ok(blob.films.f2, 'film still referenced by remaining category must survive');
  assert.deepEqual(filmsForCategory(blob, 'cat2'), [filmCard('f2')]);
});

test('filmsForCategory skips dangling film ids', () => {
  const blob: LocalBookmarksBlob = {
    categories: [{
      id: 'cat1', title: 'Favorites', filmIds: ['f1', 'ghost'], createdAt: 0,
    }],
    films: { f1: filmCard('f1') },
  };

  assert.deepEqual(filmsForCategory(blob, 'cat1'), [filmCard('f1')]);
});

test('upsertHistoryItem dedupes by film id, keeps newest first and caps the list', () => {
  let items = [historyItem('a', 1), historyItem('b', 2)];

  items = upsertHistoryItem(items, historyItem('a', 3));

  assert.deepEqual(items.map((i) => i.id), ['a', 'b']);
  assert.equal(items[0].updatedAt, 3);

  const full = Array.from(
    { length: MAX_LOCAL_HISTORY_ITEMS },
    (_, i) => historyItem(`f${i}`, i)
  );
  const capped = upsertHistoryItem(full, historyItem('new', 999));

  assert.equal(capped.length, MAX_LOCAL_HISTORY_ITEMS);
  assert.equal(capped[0].id, 'new');
});

test('upsertHistoryItem resets the watched flag of a re-watched item', () => {
  const items = setHistoryWatched([historyItem('a')], 'a', true);
  const updated = upsertHistoryItem(items, historyItem('a', 5));

  assert.equal(updated[0].isWatched, false);
});

test('removeHistoryItem and setHistoryWatched target only the given film', () => {
  const items = [historyItem('a'), historyItem('b')];

  assert.deepEqual(removeHistoryItem(items, 'a').map((i) => i.id), ['b']);

  const watched = setHistoryWatched(items, 'b', true);

  assert.equal(watched[0].isWatched, false);
  assert.equal(watched[1].isWatched, true);
});

test('setScheduleMark stores per-film overrides and supports un-marking', () => {
  let marks = setScheduleMark({}, 'film1', 'ep1', true);

  marks = setScheduleMark(marks, 'film1', 'ep2', false);
  marks = setScheduleMark(marks, 'film2', 'ep1', true);

  assert.deepEqual(marks, {
    film1: { ep1: true, ep2: false },
    film2: { ep1: true },
  });
});

test('normalizeFilmLink reduces links to comparable pathnames', () => {
  assert.equal(normalizeFilmLink('https://rezka.ag/series/x/1-a.html'), '/series/x/1-a.html');
  assert.equal(
    normalizeFilmLink('https://mirror-one.tv/series/x/1-a.html'),
    normalizeFilmLink('https://mirror-two.ag/series/x/1-a.html')
  );
  assert.equal(normalizeFilmLink('/series/x/1-a.html'), '/series/x/1-a.html');
  assert.equal(normalizeFilmLink('//host.tv/series/x/1-a.html'), '/series/x/1-a.html');
  assert.equal(normalizeFilmLink('https://rezka.ag/series/x/1-a.html/'), '/series/x/1-a.html');
  assert.equal(normalizeFilmLink('https://rezka.ag/series/x/1-a.html?t=1#top'), '/series/x/1-a.html');
});

const updatesFixture = () => [
  {
    date: '16 июля 2026',
    items: [
      { name: 'A', link: 'https://mirror.tv/films/a1', info: '1 - 1' },
      { name: 'B', link: 'https://mirror.tv/films/b2', info: '2 - 3' },
      { name: 'NoLink', link: '', info: '' },
    ],
  },
  {
    date: '15 июля 2026',
    items: [
      { name: 'C', link: 'https://mirror.tv/films/c3', info: '1 - 2' },
    ],
  },
];

test('filterUpdatesForLocalLibrary matches bookmarked and watched series across link forms', () => {
  let blob = blobWithCategories('Favorites');

  blob = toggleBookmark(blob, filmCard('a1'), 'cat1', true); // stored link is relative /films/a1
  const history = [historyItem('b2')]; // stored link /films/b2

  const filtered = filterUpdatesForLocalLibrary(updatesFixture(), blob, history);

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].date, '16 июля 2026');
  assert.deepEqual(filtered[0].items.map((item) => item.name), ['A', 'B']);
});

test('extractEpisodeKey reads single episodes and ranges from row labels', () => {
  assert.equal(extractEpisodeKey('(1 сезон) - 2 серия HDrezka Studio'), '2');
  assert.equal(extractEpisodeKey('(2 сезон) - 1-8 серия Дубляж'), '1-8');
  assert.equal(extractEpisodeKey('no episode here'), '');
});

test('extractVoiceFromInfo and normalizeVoiceTitle isolate comparable voice titles', () => {
  assert.equal(extractVoiceFromInfo('(1 сезон) - 2 серия HDrezka Studio (Украинский)'), 'HDrezka Studio (Украинский)');
  assert.equal(extractVoiceFromInfo('(1 сезон) - 2 серия (Coldfilm)'), '(Coldfilm)');
  assert.equal(extractVoiceFromInfo('no episode marker'), '');

  assert.equal(normalizeVoiceTitle('(Coldfilm)'), 'coldfilm');
  assert.equal(normalizeVoiceTitle('  HDrezka   Studio '), 'hdrezka studio');
  assert.equal(normalizeVoiceTitle('HDrezka Studio (18+)'), 'hdrezka studio (18+)');
});

test('only the exact watched voice survives; variants and other studios are dropped', () => {
  const voiceRow = (info: string) => ({ name: 'Лаки', link: '/series/thriller/9-laki.html', info });
  const items = [
    voiceRow('(1 сезон) - 2 серия HDrezka Studio (Украинский)'),
    voiceRow('(1 сезон) - 2 серия Дубляж (18+)'),
    voiceRow('(1 сезон) - 2 серия HDrezka Studio (18+)'),
    voiceRow('(1 сезон) - 2 серия hdrezka studio'),
    voiceRow('(1 сезон) - 2 серия (Coldfilm)'),
  ];

  const watched = new Map([['/series/thriller/9-laki.html', 'HDrezka Studio']]);
  const filtered = dedupeUpdateItems(items, watched);

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].info, '(1 сезон) - 2 серия hdrezka studio');
});

test('a watched voice with no release that day produces no notification for the series', () => {
  const items = [
    { name: 'Лаки', link: '/series/thriller/9-laki.html', info: '(1 сезон) - 2 серия (Coldfilm)' },
    { name: 'Лаки', link: '/series/thriller/9-laki.html', info: '(1 сезон) - 1 серия HDrezka Studio (18+)' },
  ];

  const watched = new Map([['/series/thriller/9-laki.html', 'HDrezka Studio']]);

  assert.deepEqual(dedupeUpdateItems(items, watched), []);
});

test('films without a known watched voice collapse to one row per episode', () => {
  const voiceRow = (info: string) => ({ name: 'A', link: '/series/x/1-a.html', info });
  const items = [
    voiceRow('(1 сезон) - 2 серия HDrezka Studio'),
    voiceRow('(1 сезон) - 2 серия Дубляж'),
    voiceRow('(1 сезон) - 2 серия (Субтитры)'),
  ];

  const noVoiceKnown = dedupeUpdateItems(items, new Map());

  assert.equal(noVoiceKnown.length, 1);
  assert.equal(noVoiceKnown[0].info, '(1 сезон) - 2 серия HDrezka Studio');
});

test('different episodes of one series in the same date group both survive', () => {
  const items = [
    { name: 'A', link: '/series/x/1-a.html', info: '(1 сезон) - 1 серия Дубляж' },
    { name: 'A', link: '/series/x/1-a.html', info: '(1 сезон) - 2 серия Дубляж' },
    { name: 'A', link: '/series/x/1-a.html', info: '(1 сезон) - 2 серия Субтитры' },
  ];

  const watched = new Map([['/series/x/1-a.html', 'Дубляж']]);

  assert.deepEqual(dedupeUpdateItems(items, watched).map((item) => item.info), [
    '(1 сезон) - 1 серия Дубляж',
    '(1 сезон) - 2 серия Дубляж',
  ]);

  assert.deepEqual(dedupeUpdateItems(items, new Map()).map((item) => item.info), [
    '(1 сезон) - 1 серия Дубляж',
    '(1 сезон) - 2 серия Дубляж',
  ]);
});

test('filterUpdatesForLocalLibrary keeps only the watched voice and drops voiceless days', () => {
  let blob = blobWithCategories('Favorites');

  blob = toggleBookmark(blob, filmCard('a1'), 'cat1', true);

  const history = [{
    ...historyItem('a1'),
    voiceTitle: 'HDrezka Studio',
  }];

  const updates = [
    {
      date: '16 июля 2026',
      items: [
        { name: 'A', link: 'https://mirror.tv/films/a1', info: '(1 сезон) - 2 серия Дубляж (18+)' },
        { name: 'A', link: 'https://mirror.tv/films/a1', info: '(1 сезон) - 2 серия HDrezka Studio' },
      ],
    },
    {
      date: '15 июля 2026',
      items: [
        { name: 'A', link: 'https://mirror.tv/films/a1', info: '(1 сезон) - 1 серия Дубляж (18+)' },
      ],
    },
  ];

  const filtered = filterUpdatesForLocalLibrary(updates, blob, history);

  // the watched voice released only on the 16th; the Дубляж-only day disappears
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].date, '16 июля 2026');
  assert.deepEqual(filtered[0].items.map((item) => item.info), ['(1 сезон) - 2 серия HDrezka Studio']);
});

test('filterUpdatesForLocalLibrary returns nothing for an empty library and never matches empty links', () => {
  assert.deepEqual(filterUpdatesForLocalLibrary(updatesFixture(), emptyBookmarksBlob(), []), []);

  const blob: ReturnType<typeof emptyBookmarksBlob> = {
    categories: [{
      id: 'cat1', title: 'Favorites', filmIds: ['ghost'], createdAt: 0,
    }],
    films: { ghost: { ...filmCard('ghost'), link: '' } },
  };

  assert.deepEqual(filterUpdatesForLocalLibrary(updatesFixture(), blob, []), []);
});
