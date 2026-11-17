import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

import { resolveEpisodeSelection } from '../src/util/Player/episodeSelection';
import { getLastSavedEpisode } from '../src/util/Player/savedTimeUtil';

function recentActions() {
  const text = readFileSync('src/screen/RecentScreen/RecentScreen.container.tsx', 'utf8');
  const source = ts.createSourceFile('Recent.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let object: ts.Node | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source).includes('mutate: continueWatching')
      && node.initializer && ts.isCallExpression(node.initializer)) object = node.initializer.arguments[0];
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert.ok(object);
  const base = { link: 'zona', voices: [], hasSeasons: false };
  const film = { ...base, metadataSourceFilm: { voices: [{ id: '7' }] } };
  const voice = { id: 'rezka:7' };
  const calls: string[] = [];
  const context: any = {
    sourceRouter: { loadFilm: async () => base, resolvePreferredFilm: async () => film },
    currentService: {}, isLocalLibrary: false, localHistory: [],
    resolveEpisodeSelection, getLastSavedEpisode, matchesHistoryFilm: () => true,
    filmToFilmCard: (value: unknown) => value,
    getSavedTime: () => ({ lastVoiceId: voice.id, voices: { [voice.id]: {} } }),
    sourcePlaybackRouter: { getAdapterForFilmLink: () => ({
      getFilmVoices: async (value: typeof film) => {
        assert.equal(value.metadataSourceFilm, film.metadataSourceFilm);

        return [voice];
      },
      getFilmStreamsByVoice: async () => ({ streams: [{ url: 'video' }] }),
    }) },
    openFilm: () => calls.push('details'), navigation: {},
    RouterStore: { pushData: () => calls.push('player-data') }, navigate: () => calls.push('player'),
    PLAYER_SCREEN: 'player', t: (value: string) => value,
  };
  runInNewContext(ts.transpileModule(`globalThis.actions = ${ object.getText(source)}`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);

  return { ...context.actions, calls, context, film, voice };
}

test('Recent play loads the same supplemental voice metadata as the content page', async () => {
  const actions = recentActions();
  const result = await actions.mutationFn({ link: 'zona' });
  assert.equal(result.voice.id, 'rezka:7');
  assert.equal(result.video.streams[0].url, 'video');
  actions.onSuccess(result, {});
  assert.deepEqual(actions.calls, ['player-data', 'player']);
});

test('Recent never opens an empty player and retains access to the continuation page on failure', () => {
  const actions = recentActions();
  actions.onSuccess({ film: { link: 'zona' }, video: { streams: [] } }, { image: '' });
  actions.onError(new Error('source failed'), { link: 'zona', image: '' });
  assert.deepEqual(actions.calls, ['details', 'details']);
});
for (const partialHistory of [false, true]) {
  test(`Recent reuses parsed episodes and recovers saved position with partial history=${partialHistory}`, async () => {
    const actions = recentActions();
    actions.film.hasSeasons = true;
    const voice = { ...actions.voice, seasons: [{ seasonId: '2', name: 'Season 2',
      episodes: [{ episodeId: '7', name: 'Episode 7' }] }] };
    actions.context.getSavedTime = () => ({ lastVoiceId: voice.id,
      voices: { [voice.id]: { lastSeasonId: '2', lastEpisodeId: '7', timestamps: {} } } });
    if (partialHistory) {
      actions.context.isLocalLibrary = true;
      actions.context.localHistory = [{ link: 'zona', voiceId: voice.id }];
    }
    actions.context.sourcePlaybackRouter.getAdapterForFilmLink = () => ({
      getFilmVoices: async () => [voice],
      getFilmSeasons: async () => { throw new Error('Redundant season request failed'); },
      getFilmStreamsByEpisodeId: async (_film: unknown, _voice: unknown, season: string, episode: string) => {
        assert.equal(season, '2');
        assert.equal(episode, '7');

        return { streams: [{ url: 'episode-video' }] };
      },
    });
    const result = await actions.mutationFn({ link: 'zona' });
    assert.equal(result.video.streams[0].url, 'episode-video');
  });
}

test('Recent does not reuse opaque episode IDs after the saved voice disappears', async () => {
  const actions = recentActions();
  actions.film.hasSeasons = true;
  actions.context.getSavedTime = () => ({ lastVoiceId: 'removed', voices: {
    removed: { lastSeasonId: 'opaque-season', lastEpisodeId: 'opaque-episode', timestamps: {} },
  } });
  const voice = { ...actions.voice, seasons: [{ seasonId: 'opaque-season', name: 'Season 3',
    episodes: [{ episodeId: 'opaque-episode', name: 'Episode 9' }] }] };
  let played = false;
  actions.context.sourcePlaybackRouter.getAdapterForFilmLink = () => ({
    getFilmVoices: async () => [voice], getFilmSeasons: async () => voice,
    getFilmStreamsByEpisodeId: async () => { played = true;

      return { streams: [{ url: 'wrong' }] }; },
  });
  await assert.rejects(actions.mutationFn({ link: 'zona' }), /Current season/);
  assert.equal(played, false);
});
test('saved progress is recovered from a former library ID after source preference changes', async () => {
  const { getSavedTimeForFilm } = await import('../src/util/Player/savedTimeUtil');
  const old = { filmId: 'old', lastVoiceId: 'rezka:7', voices: {
    'rezka:7': { lastSeasonId: '2', lastEpisodeId: '7', timestamps: { '2-7': { time: 40, progress: 0.2, updatedAt: 10 } } },
  } };
  const result = getSavedTimeForFilm({ id: 'zona-new', libraryId: 'old' }, id => id === 'old' ? old : null);
  assert.equal(result?.filmId, 'zona-new');
  assert.equal(result?.lastVoiceId, 'rezka:7');
  assert.equal(result?.voices['rezka:7']?.lastEpisodeId, '7');
});

test('Recent keeps the clicked legacy history record when refreshed metadata cannot match it', async () => {
  const actions = recentActions();
  actions.film.hasSeasons = true;
  const voice = { ...actions.voice, seasons: [{ seasonId: '2', name: 'Season 2',
    episodes: [{ episodeId: '7', name: 'Episode 7' }] }] };
  actions.context.isLocalLibrary = true;
  actions.context.localHistory = [{ id: 'legacy', link: 'old-link', voiceId: voice.id, seasonId: '2', episodeId: '7' }];
  actions.context.matchesHistoryFilm = () => false;
  actions.context.getSavedTime = () => null;
  actions.context.sourcePlaybackRouter.getAdapterForFilmLink = () => ({
    getFilmVoices: async () => [voice],
    getFilmStreamsByEpisodeId: async (_film: unknown, _voice: unknown, season: string, episode: string) => {
      assert.equal(season, '2'); assert.equal(episode, '7');
      return { streams: [{ url: 'legacy-episode' }] };
    },
  });
  const result = await actions.mutationFn({ id: 'legacy', link: 'zona' });
  assert.equal(result.video.streams[0].url, 'legacy-episode');
});

test('saved episode numbers survive ID rotation, partial player updates and cloud merging', async () => {
  const { withSavedEpisodePosition, combineSavedTimeVoice } = await import('../src/util/Player/savedTimeUtil');
  const voice = { id: 'voice', seasons: [{ seasonId: 'old-token', name: 'Season 2',
    episodes: [{ episodeId: 'old-episode', name: 'Episode 7' }] }], lastSeasonId: 'old-token', lastEpisodeId: 'old-episode' };
  const saved = withSavedEpisodePosition({ timestamps: {} }, voice as any);
  const partial = withSavedEpisodePosition(
    withSavedEpisodePosition(saved, { id: 'voice', lastSeasonId: 'old-token', lastEpisodeId: 'old-episode' } as any),
    { id: 'voice' } as any
  );
  assert.equal(partial.lastEpisodeId, 'old-episode');
  const combined = combineSavedTimeVoice({ timestamps: { '0': { time: 1, progress: 0.1, updatedAt: 1 } } },
    { ...partial, timestamps: { 'old-token-old-episode': { time: 40, progress: 0.2, updatedAt: 2 } } })!;
  const fresh = { ...voice, seasons: [{ seasonId: 'new-token', name: 'Season 2',
    episodes: [{ episodeId: 'new-episode', name: 'Episode 7' }] }] };
  assert.deepEqual(resolveEpisodeSelection(fresh as any, getLastSavedEpisode(combined), true), {
    seasonId: 'new-token', episodeId: 'new-episode',
  });
});
