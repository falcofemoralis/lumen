import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeZonaBroadcastUrl, parseZonaBroadcasts, zonaBroadcastImage, zonaBroadcastSession, resolveZonaBroadcastVideo } from '../src/source/adapters/ZonaBroadcasts';
import { escapeZonaQuery, mergeZonaCards, zonaDesktopCard, zonaDesktopType, requestZonaDesktopFilms, setZonaDesktopOptions, getZonaDesktopDetail } from '../src/source/adapters/ZonaDesktopCatalog';
import { FilmType } from '../src/type/FilmType.type';
import Zona from '../src/source/adapters/ZonaSourceAdapter';

test('Zona TV uses the decoded HLS link and excludes unsupported schemes', () => {
  const encoded = 'zona:?xt=urn:m3u8:' + encodeURIComponent('https://cdn.test/live.m3u8?token=a&v=2');
  assert.equal(decodeZonaBroadcastUrl(encoded), 'https://cdn.test/live.m3u8?token=a&v=2');
  assert.equal(decodeZonaBroadcastUrl('magnet:?xt=urn:btih:abc'), null);
  assert.equal(decodeZonaBroadcastUrl('file:///secret'), null);
  assert.equal(decodeZonaBroadcastUrl('zona:?xt=urn:m3u8:%ZZ'), null);
  const items = parseZonaBroadcasts([{ id: 'tv-1', name: 'Channel', adult: true,
    links: [{ u: encoded }, { u: encoded }, { u: 'magnet:?xt=x' }] }], 'tv');
  assert.equal(items.length, 1);
  assert.equal(items[0].streams.length, 1);
  assert.equal(items[0].adult, true);
});
test('Zona radio normalizes the application catalog and rejects malformed payloads', () => {
  const items = parseZonaBroadcasts([{ itemId: 'radio-1', title: 'Station', preview: 'http://cdn.test/logo.png',
    streams: [{ u: 'http://cdn.test/radio.m3u' }] }, { itemId: 'bad', title: 'Bad', streams: [] }], 'radio');
  assert.equal(items.length, 1);
  assert.equal(items[0].kind, 'radio');
  assert.equal(items[0].streams[0].url, 'http://cdn.test/radio.m3u');
  assert.throws(() => parseZonaBroadcasts({}, 'radio'), /Invalid/);
});
test('Zona desktop classification uses native genre IDs and preserves the Kinopoisk identity', () => {
  assert.equal(zonaDesktopType({ id: '1', genre2: '1750 14', serial: true }), FilmType.ANIME);
  assert.equal(zonaDesktopType({ id: '1', genre2: '14', serial: true }), FilmType.CARTOON);
  assert.equal(zonaDesktopType({ id: '1', genre2: '26 6', serial: true }), FilmType.TV_SHOW);
  assert.equal(zonaDesktopType({ id: '1', serial: true }), FilmType.SERIES);
  const card = zonaDesktopCard({ id: '123', name_id: 'example', name_rus: 'Example', year: 2020,
    serial: false, rating_imdb: 7.4, rating_kinopoisk: 6.8 });
  assert.equal(card.externalIds?.kinopoisk, '123');
  assert.equal(card.ratings?.imdb, 7.4);
  assert.equal(card.link, 'https://w1.zona.im/movies/example');
  const same = { ...card, link: 'https://w1.zona.im/movies/other-slug' };
  const distinct = { ...card, id: 'other', link: 'https://w1.zona.im/movies/other', externalIds: { kinopoisk: '456' } };
  assert.deepEqual(mergeZonaCards([card], [same, distinct]), [card, distinct]);
  assert.equal(escapeZonaQuery('Title OR id:*'), 'Title OR id\\:\\*');
});

test('Desktop requests use indexed genre IDs, enforce the adult switch and keep metadata-only records unplayable', async () => {
  const original = globalThis.fetch;
  const requests: URL[] = [];
  const doc = { id: '9123', name_id: 'sample-show', name_rus: 'Sample', serial: true,
    genre2: '26 6', genre_name: 'ток-шоу, комедия', country: 'США', country_id: '1',
    rating_imdb: 8, rating_imdb_count: 123, persons: JSON.stringify([{ r: 1, i: 42, name: 'Director' }]) };
  globalThis.fetch = async input => {
    requests.push(new URL(String(input)));
    return new Response(JSON.stringify({ response: { numFound: 61, docs: [doc] } }), { status: 200 });
  };
  try {
    setZonaDesktopOptions(() => ({ enabled: true, adult: false }));
    const page = await requestZonaDesktopFilms('tor_count:[1 TO *] AND genreId:(25 OR 26 OR 27 OR 28)', 2);
    assert.equal(page.totalPages, 2);
    assert.match(requests[0].searchParams.get('q')!, /genreId:/);
    assert.match(requests[0].searchParams.get('q')!, /adult:false/);
    assert.equal(requests[0].searchParams.get('start'), '60');
    setZonaDesktopOptions(() => ({ enabled: true, adult: true }));
    await requestZonaDesktopFilms('tor_count:[1 TO *] AND genreId:(25 OR 26 OR 27 OR 28)', 1);
    assert.doesNotMatch(requests[1].searchParams.get('q')!, /adult:false/);
    const detail = await getZonaDesktopDetail(page.films[0].link);
    assert.equal(detail?.catalogOnly, true);
    assert.deepEqual(detail?.voices, []);
    assert.equal(detail?.ratings?.[0].votes, 123);
    assert.equal(new URL(detail!.genres![0].link).searchParams.get('genre'), '26');
    assert.equal(new URL(detail!.countries![0].link).searchParams.get('country'), '1');
    assert.equal(new URL(detail!.directors![0].link!).searchParams.get('person'), '42');
  } finally { globalThis.fetch = original; setZonaDesktopOptions(() => ({ enabled: false, adult: false })); }
});
test('Zona union keeps website cards first, supplements missing records and survives desktop filter gaps', async () => {
  const original = globalThis.fetch;
  Object.assign(globalThis, { __DEV__: false });
  const website = { slug: 'union-web', title: 'Website title', year: 2020, kp_id: 777,
    rating_imdb: 8, meta: { tags: [{ slug: 'komediya', title: 'комедия', type: 'genre' }] } };
  const payload = '5:' + JSON.stringify({ entities: [website], initialPage: 1 });
  const html = '<script>self.__next_f.push([1,' + JSON.stringify(payload) + '])</script>';
  globalThis.fetch = async input => new Response(String(input).includes('zonasearch.com')
    ? JSON.stringify({ response: { numFound: 2, docs: [
      { id: '777', name_id: 'union-native-duplicate', name_rus: 'Native title', year: 2020 },
      { id: '778', name_id: 'union-native-only', name_rus: 'Extra', year: 2021 },
    ] } }) : html);
  try {
    setZonaDesktopOptions(() => ({ enabled: true, adult: false }));
    let initial = '';
    const union = await Zona.getFilms!('https://w1.zona.im/movies', 1, { deferMetadata: true,
      onProgress: result => { initial = result.films[0]?.title; } });
    assert.equal(initial, 'Website title');
    assert.deepEqual(union.films.map(value => value.title), ['Website title', 'Extra']);
    const country = await Zona.getFilms!('https://w1.zona.im/movies/filter/country-ssha', 1, { deferMetadata: true });
    assert.equal(country.films.length, 1, 'unsupported native filter must preserve the healthy website response');
    assert.equal(country.films[0].title, 'Website title');
  } finally { globalThis.fetch = original; setZonaDesktopOptions(() => ({ enabled: false, adult: false })); }
});
test('broadcast logos use Zona image cache and exact channel logos without per-card network requests', () => {
  assert.equal(zonaBroadcastImage('http://s.glaz.tv/images/logos/radio/big/1-live.jpg', 'radio'),
    'http://bimg1.zonapic.com/broadcast/radio/img/1c/1c7d744c094e22e630ccc535ed3da32a.jpg');
  const channel = parseZonaBroadcasts([{ id: 'channel-10', name: '10 канал', imageURL: null,
    links: [{ u: 'https://cdn.test/live.m3u8' }] }], 'tv')[0];
  assert.match(channel.image, /^https:\/\//);
  const ambiguous = parseZonaBroadcasts([{ id: 'channel-4', name: '4 канал', imageURL: null,
    links: [{ u: 'https://cdn.test/live.m3u8' }] }], 'tv')[0];
  assert.equal(ambiguous.image, '', 'do not substitute a different country channel with the same name');
  assert.equal(zonaBroadcastImage('file:///private', 'tv'), '');
  const radio = parseZonaBroadcasts([{ itemId: 'radio-1', title: 'Station',
    preview: 'http://s.glaz.tv/images/logos/radio/big/1-live.jpg', streams: [{ u: 'https://cdn.test/radio.mp3' }] }], 'radio')[0];
  assert.match(radio.image, /zonapic\.com\/broadcast\/radio\/img\//);
  assert.equal(radio.imageFallback, 'http://s.glaz.tv/images/logos/radio/big/1-live.jpg');
});

test('live sessions retain direct streams and do not masquerade as movie episodes', async () => {
  const broadcast = parseZonaBroadcasts([{ id: 'live-1', name: 'Live', links: [
    { u: 'https://cdn.test/a.m3u8' }, { u: 'https://cdn.test/b.m3u8' },
  ] }], 'tv')[0];
  const video = await resolveZonaBroadcastVideo(broadcast);
  const session = zonaBroadcastSession(broadcast, video);
  assert.equal(session.video.streams.length, 2);
  assert.equal(session.film.hasSeasons, false);
  assert.equal(session.film.hasVoices, false);
  assert.match(session.film.id, /^ZONA:live:tv:/);
  assert.equal(session.voice.video, video);
  assert.equal(session.film.voices[0], session.voice);
});