import assert from 'node:assert/strict';
import { test } from 'node:test';

import { rankSearchResults } from '../src/source/search/searchRelevance';

test('exact title beats unrelated results from an earlier source', () => {
  const cards = [{ title: 'Аниме про школу' }, { title: 'Флеш: начало' }, { title: 'Флеш' }];
  assert.equal(rankSearchResults(cards, 'флеш')[0].title, 'Флеш');
});
test('original titles and yo are normalized without reordering ties', () => {
  const cards = [{ title: 'Other' }, { title: 'Мёртвая зона' }, { title: 'Вышка', originalTitle: 'Dead Zone' }];
  assert.equal(rankSearchResults(cards, 'мертвая зона')[0], cards[1]);
  assert.equal(rankSearchResults(cards, 'dead zone')[0], cards[2]);
  assert.deepEqual(rankSearchResults(cards, 'unmatched'), cards);
});
test('whole query words outrank partial matches and preserve input', () => {
  const cards = [{ title: 'Зона' }, { title: 'Мёртвая новая зона' }, { title: 'Мёртвая зона' }];
  assert.deepEqual(rankSearchResults(cards, 'мёртвая зона'), [cards[2], cards[1], cards[0]]);
  assert.equal(cards[0].title, 'Зона');
});
