import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectSeriesUpdateRows, parseSeriesUpdateBlocks } from 'Api/RezkaApi/seriesUpdates';
import { parseHtml } from 'Util/Parser';

const trackedCollector = (el: Parameters<typeof collectSeriesUpdateRows>[0]) => el.querySelectorAll('.tracked');

const primaryMarkup = `
<div class="b-seriesupdate__block">
  <div class="b-seriesupdate__block_date">16 июля 2026 развернуть</div>
  <ul class="b-seriesupdate__block_list">
    <li class="b-seriesupdate__block_list_item tracked">
      <span class="season">2 сезон</span>
      <a class="b-seriesupdate__block_list_link" href="https://mirror-a.tv/series/thriller/1-a.html">Series A</a>
      <span class="cell cell-2">5 серия</span>
    </li>
    <li class="b-seriesupdate__block_list_item">
      <span class="season">1 сезон</span>
      <a class="b-seriesupdate__block_list_link" href="https://mirror-a.tv/series/drama/2-b.html">Series B</a>
      <span class="cell cell-2">3 серия</span>
    </li>
  </ul>
</div>
<div class="b-seriesupdate__block">
  <div class="b-seriesupdate__block_date">15 июля 2026</div>
  <ul class="b-seriesupdate__block_list">
    <li class="b-seriesupdate__block_list_item">
      <span class="season">4 сезон</span>
      <a class="b-seriesupdate__block_list_link" href="/series/comedy/3-c.html">Series C</a>
      <span class="cell cell-2">8 серия</span>
    </li>
  </ul>
</div>
`;

test('parses every update row with the primary row selector', () => {
  const blocks = parseSeriesUpdateBlocks(parseHtml(primaryMarkup), collectSeriesUpdateRows);

  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].date, '16 июля 2026');
  assert.equal(blocks[1].date, '15 июля 2026');
  assert.deepEqual(blocks[0].items, [
    { name: 'Series A', link: 'https://mirror-a.tv/series/thriller/1-a.html', info: '2 сезон - 5 серия' },
    { name: 'Series B', link: 'https://mirror-a.tv/series/drama/2-b.html', info: '1 сезон - 3 серия' },
  ]);
  assert.deepEqual(blocks[1].items, [
    { name: 'Series C', link: '/series/comedy/3-c.html', info: '4 сезон - 8 серия' },
  ]);
});

test('tracked collector returns exactly the tracked subset (account-mode parity)', () => {
  const blocks = parseSeriesUpdateBlocks(parseHtml(primaryMarkup), trackedCollector);

  assert.deepEqual(blocks[0].items, [
    { name: 'Series A', link: 'https://mirror-a.tv/series/thriller/1-a.html', info: '2 сезон - 5 серия' },
  ]);
  assert.deepEqual(blocks[1].items, []);
});

test('fallback finds flat rows without the inferred row class', () => {
  const markup = `
  <div class="b-seriesupdate__block">
    <div class="b-seriesupdate__block_date">14 июля 2026 развернуть</div>
    <ul class="some-list">
      <li class="some-row">
        <span class="season">1 сезон</span>
        <a class="b-seriesupdate__block_list_link" href="/series/x/4-d.html">Series D</a>
        <span class="cell-2">2 серия</span>
      </li>
    </ul>
  </div>
  `;

  const blocks = parseSeriesUpdateBlocks(parseHtml(markup), collectSeriesUpdateRows);

  assert.deepEqual(blocks[0].items, [
    { name: 'Series D', link: '/series/x/4-d.html', info: '1 сезон - 2 серия' },
  ]);
});

test('fallback climbs past cell wrappers to the row element', () => {
  const markup = `
  <div class="b-seriesupdate__block">
    <div class="b-seriesupdate__block_date">13 июля 2026</div>
    <ul class="some-list">
      <li class="some-row">
        <div class="cell cell-1">
          <span class="season">3 сезон</span>
          <a class="b-seriesupdate__block_list_link" href="/series/x/5-e.html">Series E</a>
        </div>
        <div class="cell cell-2">7 серия</div>
      </li>
    </ul>
  </div>
  `;

  const blocks = parseSeriesUpdateBlocks(parseHtml(markup), collectSeriesUpdateRows);

  assert.deepEqual(blocks[0].items, [
    { name: 'Series E', link: '/series/x/5-e.html', info: '3 сезон - 7 серия' },
  ]);
});

test('degenerate fallback still yields name and link when no episode cell exists', () => {
  const markup = `
  <div class="b-seriesupdate__block">
    <div class="b-seriesupdate__block_date">12 июля 2026</div>
    <ul class="some-list">
      <li class="some-row">
        <a class="b-seriesupdate__block_list_link" href="/series/x/6-f.html">Series F</a>
      </li>
    </ul>
  </div>
  `;

  const blocks = parseSeriesUpdateBlocks(parseHtml(markup), collectSeriesUpdateRows);

  assert.equal(blocks[0].items.length, 1);
  assert.equal(blocks[0].items[0].name, 'Series F');
  assert.equal(blocks[0].items[0].link, '/series/x/6-f.html');
});

test('empty widget and empty blocks parse to empty structures', () => {
  assert.deepEqual(parseSeriesUpdateBlocks(parseHtml('<div>no widget</div>'), collectSeriesUpdateRows), []);

  const emptyBlock = `
  <div class="b-seriesupdate__block">
    <div class="b-seriesupdate__block_date">11 июля 2026</div>
    <ul class="b-seriesupdate__block_list"></ul>
  </div>
  `;
  const blocks = parseSeriesUpdateBlocks(parseHtml(emptyBlock), collectSeriesUpdateRows);

  assert.equal(blocks.length, 1);
  assert.deepEqual(blocks[0].items, []);
});
