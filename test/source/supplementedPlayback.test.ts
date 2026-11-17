import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSupplementedPlaybackAdapter, supplementVoices } from '../../src/source/playback/createSupplementedPlaybackAdapter';
import { ContentSource } from '../../src/source/types/ContentSource';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmType } from 'Type/FilmType.type';
const voice = (id: string, title: string): FilmVoiceInterface => ({
  id, identifier: id, title, isActive: true, isPremium: false,
  isCamrip: '0', isAds: '0', isDirector: '0',
});
const film = (link: string, voices: FilmVoiceInterface[]): FilmInterface => ({
  id: link, link, title: 'Film', poster: '', type: FilmType.SERIES,
  hasVoices: true, hasSeasons: true, voices,
});
test('Zona voices come first and only missing Rezka voices are appended with native IDs intact', () => {
  const combined = supplementVoices([voice('zona:a', 'Дубляж')], [voice('1', 'Дубляж'), voice('2', 'LostFilm')]);
  assert.equal(combined.length, 2);
  assert.equal(combined[0].identifier, 'zona:a');
  assert.equal(combined[1].nativeVoiceId, '2');
  assert.equal(combined[1].playbackSource, 'REZKA');
  assert.match(combined[1].title, /HDRezka/);
});
test('supplemental seasons and streams use matched Rezka film and native translator, including next episode', async () => {
  const rz = film('rezka-film', [voice('2', 'LostFilm')]);
  const z = { ...film('zona-film', [voice('zona', 'Zona')]), metadataSourceFilm: rz };
  let nativeId = '', nativeFilm = '', episode = '';
  const adapter = createSupplementedPlaybackAdapter({
    source: ContentSource.ZONA, getFilmVoices: async () => [voice('zona:a', 'Дубляж')],
    getFilmSeasons: async (_film, v) => v,
    getFilmStreamsByVoice: async () => ({ streams: [{ quality: '720p', url: 'zona-url' }] }),
    getFilmStreamsByEpisodeId: async () => ({ streams: [{ quality: '720p', url: 'zona-episode' }] }),
  }, {
    getFilmSeasons: async (f, v) => {
      nativeId = v.id; nativeFilm = f.id;
      return { ...v, seasons: [{ name: '1', seasonId: '1', episodes: [{ name: '1', episodeId: '1' }] }] };
    },
    getFilmStreamsByVoice: async (f, v) => {
      nativeId = v.id; nativeFilm = f.id;
      return { streams: [{ quality: '720p', url: 'rezka-url' }] };
    },
    getFilmStreamsByEpisodeId: async (f, v, s, e) => {
      nativeId = v.id; nativeFilm = f.id; episode = s + ':' + e;
      return { streams: [{ quality: '720p', url: 'rezka-episode' }] };
    },
  });
  const voices = await adapter.getFilmVoices(z);
  const supplemental = voices[1];
  const selected = await adapter.getFilmSeasons(z, supplemental);
  assert.equal(selected.id, supplemental.id);
  assert.equal(nativeId, '2'); assert.equal(nativeFilm, 'rezka-film');
  await adapter.getFilmStreamsByEpisodeId(z, selected, '2', '4');
  assert.equal(episode, '2:4'); assert.equal(nativeId, '2');
  assert.equal((await adapter.getFilmStreamsByVoice(z, voices[0])).streams[0].url, 'zona-url');
});
test('failed Zona discovery retains available Rezka voices and is retried on next open', async () => {
  let calls = 0;
  const adapter = createSupplementedPlaybackAdapter({
    source: ContentSource.ZONA,
    getFilmVoices: async () => { calls++; throw new Error('Zona unavailable'); },
    getFilmSeasons: async (_f, v) => v,
    getFilmStreamsByVoice: async () => ({ streams: [] }),
    getFilmStreamsByEpisodeId: async () => ({ streams: [] }),
  }, {
    getFilmSeasons: async (_f, v) => v,
    getFilmStreamsByVoice: async () => ({ streams: [] }),
    getFilmStreamsByEpisodeId: async () => ({ streams: [] }),
  });
  const z = { ...film('zona', []), metadataSourceFilm: film('rezka', [voice('2', 'LostFilm')]) };
  assert.equal((await adapter.getFilmVoices(z))[0].playbackSource, 'REZKA');
  await adapter.getFilmVoices(z);
  assert.equal(calls, 2);
});
