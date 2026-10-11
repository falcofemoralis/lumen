import assert from 'node:assert/strict';
import { test } from 'node:test';
import { preferredCardForDisplay, preferredCardsSignature, preferredCardsSnapshot, shouldRefreshZonaSeries, cardsAcrossFolders } from '../../src/source/search/PreferredFilmCards';
import { matchesHomeTab } from '../../src/config/HomeMenu';
import { FilmType } from '../../src/type/FilmType.type';
import { FilmCardInterface } from '../../src/type/FilmCard.interface';

const card = (id: string, pending = false): FilmCardInterface => ({ id, link: 'https://w1.zona.im/movies/' + id, type: FilmType.FILM, contentTypePending: pending, poster: '', title: id, subtitle: '' });
test('metadata-only renders do not change the preferred-card query signature', () => {
  const cards = [card('a'), card('b')];
  assert.equal(preferredCardsSignature(cards), preferredCardsSignature(cards.map((value) => ({ ...value, ratings: { imdb: 8 } }))));
  assert.notEqual(preferredCardsSignature(cards), preferredCardsSignature([...cards, card('c')]));
});
test('appending a page retains classified cards instead of collapsing the visible Home list', () => {
  const original = [card('a', true), card('b', true)];
  const enriched = original.map((value) => ({ ...value, contentTypePending: false, ratings: { imdb: 8 } }));
  const known = new Map(enriched.map((value) => [value.link, value]));
  const visible = (snapshot: Map<string, FilmCardInterface>) => [...snapshot.values()].filter((value) => matchesHomeTab('zona-movies', value)).map((value) => value.id);
  const first = preferredCardsSnapshot(original, known);
  const second = preferredCardsSnapshot([...original, card('c', true)], known);
  assert.deepEqual(visible(first), ['a', 'b']);
  assert.deepEqual(visible(second), ['a', 'b']);
  assert.equal(second.get(original[0].link), enriched[0]);
  assert.equal(known.size, 2);
  const resumed = preferredCardsSnapshot([...original, card('c', true)], known);
  assert.deepEqual(visible(resumed), ['a', 'b']);
});
test('background metadata keeps the displayed catalog poster and all enriched fields', () => {
  const original = { ...card('a', true), poster: 'catalog.jpg' };
  const enriched = { ...original, poster: 'detail.jpg', contentTypePending: false, type: FilmType.CARTOON, ratings: { imdb: 8 }, info: 'Season 2' };
  const displayed = preferredCardForDisplay(original, enriched);
  assert.equal(displayed.poster, 'catalog.jpg');
  assert.equal(displayed.type, FilmType.CARTOON);
  assert.equal(displayed.contentTypePending, false);
  assert.equal(displayed.ratings?.imdb, 8);
  assert.equal(displayed.info, 'Season 2');
  assert.equal(preferredCardForDisplay(original, enriched, true).poster, 'detail.jpg');
  assert.equal(preferredCardForDisplay(original, { ...enriched, link: 'https://other/source' }).poster, 'detail.jpg');
  assert.equal(preferredCardForDisplay({ ...original, poster: '' }, enriched).poster, 'detail.jpg');
});

test('unchanged displayed cards retain object identity during updates to another card', () => {
  const original = card('a');
  const enriched = { ...original, ratings: { imdb: 8 } };
  assert.equal(preferredCardForDisplay(original), original);
  assert.equal(preferredCardForDisplay(original, enriched), enriched);
});
test('Home refreshes partial and stale series status without repeating requests on pagination', () => {
  const series = { ...card('series'), link: 'https://w1.zona.im/tvseries/series', type: FilmType.SERIES };
  for (const info of [undefined, 'Сезон 1', 'В ожидании', 'Сезон 1 • серия 4 • выходит', 'завершён']) {
    assert.equal(shouldRefreshZonaSeries({ ...series, info }, undefined, 1000), true);
    assert.equal(shouldRefreshZonaSeries({ ...series, info }, 1000, 2000), false);
    assert.equal(shouldRefreshZonaSeries({ ...series, info }, 1000, 301000), true);
  }
  assert.equal(shouldRefreshZonaSeries({ ...series, contentTypePending: true }), false);
  assert.equal(shouldRefreshZonaSeries(card('movie')), false);
});
test('bookmark refresh visits every folder fairly and checks shared films once', () => {
  const folders = [
    { films: [card('a'), card('b'), card('c')] },
    { films: [card('d'), card('a')] },
    { films: [card('e')] },
    { films: null },
  ];
  assert.deepEqual(cardsAcrossFolders(folders).map(value => value.id), ['a', 'd', 'e', 'b', 'c']);
  assert.deepEqual(cardsAcrossFolders([]), []);
});