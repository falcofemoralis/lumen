import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { SourcePlaybackAdapter } from '../src/source/playback/SourcePlaybackAdapter';
import { createZonaTorrentPlaybackAdapter, torrentVoices } from '../src/source/playback/ZonaTorrentPlaybackAdapter';
import { createTorrentClient, matchTorrentFile } from '../src/source/torrent/client';
import { parseZonaTorrent } from '../src/source/torrent/model';
import { ContentSource } from '../src/source/types/ContentSource';
import type { FilmInterface } from '../src/type/Film.interface';
import { FilmType } from '../src/type/FilmType.type';

const hash = '0123456789abcdef0123456789abcdef01234567';
const doc = { hash, torrent_download_link: `magnet:?xt=urn:btih:${ hash}`, translate_info: 'Studio',
  resolution: '1920x1080',
  filenames: JSON.stringify(['Show.S01E02.mkv', 'sample.mkv', 'cover.jpg']), seeds: 4, playable: true };
const film: FilmInterface = { id: '1', link: 'https://w1.zona.im/tvseries/show', title: 'Show', poster: '',
  type: FilmType.SERIES, hasSeasons: true, hasVoices: false, voices: [], catalogOnly: true,
  externalIds: { kinopoisk: '123' } };
const connection = { baseUrl: 'http://127.0.0.1:8090', authorization: 'Basic test', hls: false };
const readyResponse = (input: RequestInfo | URL) => {
  const url = new URL(String(input));
  if (url.searchParams.has('preload')) {
    return new Response(JSON.stringify({ file_stats: [{ id: 7, path: 'Folder/Show.S01E02.mkv' },
      { id: 1, path: 'movie.mp4' }] }));
  }

  return new Response(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]), { status: 206 });
};
const online: SourcePlaybackAdapter = { source: ContentSource.ZONA, getFilmVoices: async () => [],
  getFilmSeasons: async (_film, voice) => voice, getFilmStreamsByVoice: async () => ({ streams: [] }),
  getFilmStreamsByEpisodeId: async () => ({ streams: [] }) };

test('Zona torrents validate magnet identity and exclude private, restricted and sample media', () => {
  const value = parseZonaTorrent(doc)!;
  assert.equal(value.quality, '1080p');
  assert.equal(parseZonaTorrent({ ...doc, resolution: '1280x534' })?.quality, '720p');
  assert.equal(parseZonaTorrent({ ...doc, resolution: '3840x1634' })?.quality, '2160p');
  assert.deepEqual(value.files, [{ path: 'Show.S01E02.mkv', season: 1, episode: 2 }]);
  for (const change of [{ private: true }, { trailer: true }, { playable: false }, { adult: true },
    { hash: 'bad' }, { torrent_download_link: 'https://bad.test/file.torrent' }, { filenames: '{}' }]) {
    assert.equal(parseZonaTorrent({ ...doc, ...change }), null);
  }
});
test('explicit Zona episode map supports opaque filenames and season zero', () => {
  const release = parseZonaTorrent({ ...doc, filenames: '["special.mkv"]',
    episodes_map_auto: '{"S00E01":"special.mkv"}' })!;
  assert.equal(release.files[0].season, 0);
  assert.equal(release.files[0].episode, 1);
});
test('same translation and quality combine seasons without starting the torrent engine', async () => {
  const first = parseZonaTorrent(doc)!;
  const second = { ...first, hash: 'f'.repeat(40), files: [{ path: 'Show.S02E01.mkv', season: 2, episode: 1 }] };
  let starts = 0;
  const adapter = createZonaTorrentPlaybackAdapter(online, async () => { starts++;

    return connection; }, () => true, async () => [first, second]);
  const voices = await adapter.getFilmVoices(film);
  assert.equal(voices.length, 1);
  assert.deepEqual(voices[0].seasons?.map(item => item.seasonId), ['1', '2']);
  assert.equal(starts, 0);
  assert.equal((await adapter.getFilmSeasons(film, voices[0])).seasons?.[0].episodes[0].episodeId, '2');
  assert.equal(starts, 0);
});
test('disabling torrents blocks their playback but preserves normal website voices', async () => {
  let starts = 0;
  const adapter = createZonaTorrentPlaybackAdapter(online, async () => { starts++;

    return connection; }, () => false);
  await assert.rejects(adapter.getFilmVoices(film), /disabled/);
  const voice = torrentVoices([parseZonaTorrent(doc)!], true)[0];
  await assert.rejects(adapter.getFilmStreamsByVoice(film, voice), /disabled/);
  assert.deepEqual(await adapter.getFilmVoices({ ...film, catalogOnly: false }), []);
  assert.equal(starts, 0);
});
test('torrent file matching uses actual engine indices and rejects duplicate basenames', () => {
  const files = [{ id: 4, path: 'Folder/Show.S01E02.mkv' }, { id: 2, path: 'cover.jpg' }];
  assert.equal(matchTorrentFile(files, 'Show.S01E02.mkv')?.id, 4);
  assert.equal(matchTorrentFile([...files, { id: 5, path: 'Other/Show.S01E02.mkv' }], 'Show.S01E02.mkv'), undefined);
  assert.equal(matchTorrentFile(files, 'Show.S01E03.mkv'), undefined);
});
test('stream and explicit download share the verified file but use platform-appropriate transport', async () => {
  const original = globalThis.fetch;
  const bodies: any[] = [];
  globalThis.fetch = async (_url, options) => {
    if (options?.method !== 'POST') return readyResponse(_url);
    bodies.push(JSON.parse(String(options?.body)));

    return new Response(JSON.stringify({ hash, file_stats: [{ id: 7, path: 'Folder/Show.S01E02.mkv' }] }));
  };
  try {
    const client = createTorrentClient(async () => ({ ...connection, hls: true }));
    const stream = await client.stream(parseZonaTorrent(doc)!, 'Show.S01E02.mkv');
    assert.match(stream.url, /\/gst\/.*\/master\.m3u8\?index=7$/);
    assert.equal(new URL(stream.downloadUrl).searchParams.get('index'), '7');
    assert.equal(stream.headers.Authorization, connection.authorization);
    assert.equal(bodies[0].save_to_db, false);
  } finally { globalThis.fetch = original; }
});
test('unmapped series files cannot silently play the wrong episode', async () => {
  const release = parseZonaTorrent({ ...doc, filenames: '["unknown.mkv"]' })!;
  assert.deepEqual(torrentVoices([release], true), []);
});

test('MP4 streams remain direct even when the Windows HLS helper is available', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => options?.method === 'POST'
    ? new Response(JSON.stringify({ file_stats: [{ id: 1, path: 'movie.mp4' }] })) : readyResponse(url);
  try {
    const release = parseZonaTorrent({ ...doc, filenames: '["movie.mp4"]' })!;
    const stream = await createTorrentClient(async () => ({ ...connection, hls: true })).stream(release, 'movie.mp4');
    assert.equal(stream.url, stream.downloadUrl);
    assert.match(stream.url, /\/stream\/movie\.mp4/);
  } finally { globalThis.fetch = original; }
});

test('release samples and numbered samples do not suppress the main film voice', () => {
  const release = parseZonaTorrent({ ...doc,
    filenames: '["Film.mkv","Film(sample).mkv","Sample1.avi","ETRG.mp4"]',
    files: '{"Film.mkv":1500000000,"Film(sample).mkv":1000000,"Sample1.avi":1000000,"ETRG.mp4":1500000}' })!;
  assert.equal(release.files.length, 2);
  const voices = torrentVoices([release], false);
  assert.equal(voices.length, 1);
  assert.equal(voices[0].torrentReleases?.[0].files[0].path, 'Film.mkv');
  assert.equal(torrentVoices([{ ...release, files: [{ path: 'Part1.mkv', size: 100 },
    { path: 'Part2.mkv', size: 100 }] }], false).length, 0);
});

test('player URLs are withheld until torrent preload and actual video bytes are ready', async () => {
  const original = globalThis.fetch;
  let ready!: () => void;
  const buffer = new Promise<void>(resolve => { ready = resolve; });
  let probed = false, returned = false;
  globalThis.fetch = async (input, options) => {
    if (options?.method === 'POST') {
      return new Response(JSON.stringify({ file_stats: [{ id: 7, path: 'Show.S01E02.mkv' }] }));
    }
    if (String(input).includes('preload=')) {
      await buffer;

      return readyResponse(input);
    }
    probed = true;

    return readyResponse(input);
  };
  try {
    const pending = createTorrentClient(async () => connection).stream(parseZonaTorrent(doc)!, 'Show.S01E02.mkv')
      .then(value => {
        returned = true;

        return value;
      });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(returned, false);
    assert.equal(probed, false);
    ready();
    await pending;
    assert.equal(probed, true);
    assert.equal(returned, true);
  } finally { ready(); globalThis.fetch = original; }
});

test('website catalog entries without online voices can discover torrents when enabled', async () => {
  const release = parseZonaTorrent(doc)!;
  const adapter = createZonaTorrentPlaybackAdapter(online, async () => connection, () => true, async () => [release]);
  const voices = await adapter.getFilmVoices({ ...film, catalogOnly: false });
  assert.equal(voices.length, 1);
  assert.ok(voices[0].torrentReleases);
});

test('Bikini Destinations mixed containers retain provider episode mapping', () => {
  const release = parseZonaTorrent({ ...doc,
    filenames: JSON.stringify(['Hawaii.avi', 'Best Of.mpg', 'Buzios.mkv', 'Disc.m2ts']),
    episodes_map_auto: JSON.stringify({ S01E01: 'Hawaii.avi', S01E15: 'Best Of.mpg',
      S02E14: 'Buzios.mkv', S03E01: 'Disc.m2ts' }) })!;
  const voices = torrentVoices([release], true);
  assert.equal(voices.length, 1);
  assert.deepEqual(release.files.map(file => [file.season, file.episode]), [[1, 1], [1, 15], [2, 14], [3, 1]]);
  assert.deepEqual(voices[0].seasons?.map(season => season.episodes.map(episode => episode.episodeId)),
    [['1', '15'], ['14'], ['1']]);
});

test('failed torrent preparation never hands an unusable URL to the player', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, options) => options?.method === 'POST'
    ? new Response(JSON.stringify({ file_stats: [{ id: 7, path: 'Show.S01E02.mkv' }] }))
    : new Response('No peers', { status: 503 });
  try {
    await assert.rejects(createTorrentClient(async () => connection).stream(parseZonaTorrent(doc)!, 'Show.S01E02.mkv'),
      /HTTP 503/);
  } finally { globalThis.fetch = original; }
});