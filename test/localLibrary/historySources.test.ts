import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FilmType } from '../../src/type/FilmType.type';
import type { FilmVoiceInterface } from '../../src/type/FilmVoice.interface';
import type { LocalHistoryItemInterface } from '../../src/type/LocalLibrary.interface';
import { parseHistoryList, upsertHistoryItem } from '../../src/util/LocalLibrary/logic';
import { episodePosition, resolveEpisodeSelection } from '../../src/util/Player/episodeSelection';

const item = (id: string, link: string, updatedAt: number, imdb = 'tt123'): LocalHistoryItemInterface => ({
  id, link, updatedAt, title: 'Example', poster: '', isWatched: false,
  voiceId: `voice-${ id}`, seasonId: '2', episodeId: '5',
  filmCard: { id, link, title: 'Example', poster: '', subtitle: '2020', type: FilmType.SERIES, externalIds: { imdb } },
});

test('existing history combines provider cards and retains the latest playback position', () => {
  const old = item('10', '/series/drama/10-example-2020.html', 1);
  const latest = item('ZONA:example', 'https://w1.zona.im/tvseries/example', 2);
  const result = parseHistoryList(JSON.stringify([old, latest]));
  assert.equal(result.length, 1);
  assert.equal(result[0].voiceId, latest.voiceId);
  assert.equal(result[0].seasonId, '2');
  assert.equal(result[0].episodeId, '5');
  assert.equal(result[0].filmCard?.sources?.length, 2);
});

test('watching the same title through another source replaces the existing card, not another work', () => {
  const old = item('10', '/series/drama/10-example-2020.html', 1);
  const other = item('11', '/series/drama/11-example-2020.html', 2, 'tt456');
  const latest = item('ZONA:example', 'https://w1.zona.im/tvseries/example', 3);
  const result = upsertHistoryItem([old, other], latest);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, latest.id);
  assert.ok(result.some(entry => entry.id === other.id));
});

const target = { id: 'new', seasons: [{ seasonId: 'provider-season', name: '2 сезон', episodes: [
  { episodeId: 'provider-episode', name: '5 серия' },
] }] } as FilmVoiceInterface;

test('changing voice/source carries numeric season and episode to opaque provider IDs', () => {
  assert.deepEqual(resolveEpisodeSelection(target, { seasonId: '2', episodeId: '5' }), {
    seasonId: 'provider-season', episodeId: 'provider-episode',
  });
  const sameVoice = episodePosition(target, 'provider-season', 'provider-episode');
  assert.deepEqual(resolveEpisodeSelection(target, sameVoice, true), {
    seasonId: 'provider-season', episodeId: 'provider-episode',
  });
});

test('missing episode is never silently mapped to the first available episode', () => {
  assert.equal(resolveEpisodeSelection(target, { seasonNumber: 2, episodeNumber: 6 }), undefined);
});

test('opaque source IDs preserve position through their explicit episode labels', () => {
  const old = { id: 'old', seasons: [{ seasonId: 'source-season', name: 'Сезон 2', episodes: [
    { episodeId: 'source-episode', name: 'Серия 5' },
  ] }] } as FilmVoiceInterface;
  const position = episodePosition(old, 'source-season', 'source-episode');
  assert.equal(position.seasonNumber, 2);
  assert.equal(position.episodeNumber, 5);
  assert.deepEqual(resolveEpisodeSelection(target, position), {
    seasonId: 'provider-season', episodeId: 'provider-episode',
  });
});

test('equal provider IDs do not override different cross-source episode numbers', () => {
  const different = { id: 'new', seasons: [{ seasonId: '2', name: '1 сезон', episodes: [
    { episodeId: '5', name: '1 серия' },
  ] }] } as FilmVoiceInterface;
  assert.equal(resolveEpisodeSelection(different, { seasonId: '2', episodeId: '5' }), undefined);
});
