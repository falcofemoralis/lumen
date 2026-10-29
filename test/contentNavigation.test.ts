import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FilmType } from 'Type/FilmType.type';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { getHomeMenu, arrangeHomeMenu, matchesHomeTab } from '../src/config/HomeMenu';
import { findAdjacentEpisode, resolveAdjacentEpisode } from '../src/util/Player/episodeNavigation';
import { ContentFilters, matchesContentFilters } from '../src/source/search/ContentFilters';

const voice: FilmVoiceInterface = {
  id: '42', identifier: '42', title: 'Озвучка', isCamrip: '0', isDirector: '0', isAds: '0',
  isPremium: false, isActive: true, lastSeasonId: 's1', lastEpisodeId: 'e2',
  seasons: [
    { seasonId: 's1', name: 'Сезон 1', episodes: [{ episodeId: 'e1', name: '1' }, { episodeId: 'e2', name: '2' }] },
    { seasonId: 'empty', name: 'Пустой сезон', episodes: [] },
    { seasonId: 's2', name: 'Сезон 2', episodes: [{ episodeId: 'e3', name: '3' }] },
  ],
};
test('next episode crosses season boundaries and skips empty seasons', () => {
  const next = findAdjacentEpisode(voice, 1);
  assert.equal(next?.seasonId, 's2');
  assert.equal(next?.episode.episodeId, 'e3');
});
test('previous episode crosses back and boundaries never replay the current episode', () => {
  const last = { ...voice, lastSeasonId: 's2', lastEpisodeId: 'e3' };
  assert.equal(findAdjacentEpisode(last, -1)?.episode.episodeId, 'e2');
  assert.equal(findAdjacentEpisode(last, 1), null);
  assert.equal(findAdjacentEpisode({ ...voice, lastEpisodeId: 'e1' }, -1), null);
});
test('incomplete saved voice refreshes exactly the selected translator before resolving the next episode', async () => {
  const stale = { ...voice, seasons: [] };
  let fetchedId = '';
  const result = await resolveAdjacentEpisode(stale, 1, async (selected) => {
    fetchedId = selected.id;
    return { ...voice, lastSeasonId: undefined, lastEpisodeId: undefined };
  });
  assert.equal(fetchedId, '42');
  assert.equal(result?.voice.id, '42');
  assert.equal(result?.voice.lastSeasonId, 's2');
  assert.equal(result?.voice.lastEpisodeId, 'e3');
  assert.equal(result?.voice.seasons?.length, 3);
});
test('a missing current episode is not replaced with an arbitrary first episode', async () => {
  assert.equal(await resolveAdjacentEpisode({ ...voice, lastEpisodeId: 'unknown' }, 1), null);
});

test('Home keeps every source menu and applies order and visibility without duplicates', () => {
  const items = getHomeMenu([{ id: 'popular', title: 'Популярное', path: '/new' }]);
  assert.equal(items.length, 7);
  assert.ok(items.some((item) => item.id === 'anixart-donghua'));
  const visible = arrangeHomeMenu(items, ['zona-anime', 'popular', 'zona-anime', 'gone'], ['zona-series']);
  assert.equal(visible[0].id, 'zona-anime');
  assert.equal(visible[1].id, 'popular');
  assert.equal(new Set(visible.map((item) => item.id)).size, visible.length);
  assert.ok(!visible.some((item) => item.id === 'zona-series'));
});
test('Home has a usable tab when stale settings hide every menu item', () => {
  const items = getHomeMenu([]);
  assert.equal(arrangeHomeMenu(items, [], items.map((item) => item.id)).length, 1);
});

const film: FilmInterface = {
  id: '1', title: 'Пример', link: 'link', poster: '', releaseDate: '5 июня 2020',
  type: FilmType.CARTOON, voices: [], hasSeasons: false, hasVoices: false,
  countries: [{ name: 'США' }, { name: 'Франция' }], genres: [{ name: 'комедия' }],
};
const filters: ContentFilters = { includedCountries: [], excludedCountries: [] };
test('year range is inclusive and does not accept an unknown year when constrained', () => {
  assert.equal(matchesContentFilters(film, { ...filters, from: 2020, to: 2020 }), true);
  assert.equal(matchesContentFilters(film, { ...filters, to: 2019 }), false);
  assert.equal(matchesContentFilters({ ...film, releaseDate: undefined }, { ...filters, from: 2000 }), false);
});
test('country exclusion takes precedence even for a coproduction with an included country', () => {
  assert.equal(matchesContentFilters(film, { ...filters, includedCountries: ['сша'] }), true);
  assert.equal(matchesContentFilters(film, { includedCountries: ['США'], excludedCountries: ['Франция'] }), false);
  assert.equal(matchesContentFilters(film, { ...filters, includedCountries: ['Япония'] }), false);
});
test('content type and genre use metadata rather than similar titles', () => {
  assert.equal(matchesContentFilters(film, { ...filters, type: FilmType.CARTOON, genre: 'КОМЕДИЯ' }), true);
  assert.equal(matchesContentFilters(film, { ...filters, type: FilmType.FILM }), false);
  assert.equal(matchesContentFilters(film, { ...filters, genre: 'боевик' }), false);
});
test('Home type tabs exclude animation from movies and series before and after enrichment', () => {
  const tabs = ['zona-movies', 'zona-series', 'zona-cartoons', 'zona-anime'];
  const types = [FilmType.FILM, FilmType.SERIES, FilmType.CARTOON, FilmType.ANIME];
  for (let i = 0; i < tabs.length; i++) {
    for (let j = 0; j < types.length; j++) {
      assert.equal(matchesHomeTab(tabs[i], { type: types[j] }), i === j);
      assert.equal(matchesHomeTab(tabs[i], { type: types[j], contentTypePending: true }), false);
    }
  }
  assert.equal(matchesHomeTab('popular', { type: FilmType.CARTOON }), true);
  assert.equal(matchesHomeTab('zona-movies', { type: FilmType.TV_SHOW }), false);
});