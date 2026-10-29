import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createZonaShowsCatalog, ZONA_SHOWS_CATALOGS } from '../src/source/adapters/ZonaShowsCatalog';
import { isZonaWebAvailable } from '../src/source/adapters/ZonaSourceAdapter';
import { zonaDesktopCard, zonaDesktopImage, supplementZonaDetails } from '../src/source/adapters/ZonaDesktopCatalog';
import { FilmType } from '../src/type/FilmType.type';
import { FilmInterface } from '../src/type/Film.interface';

const card = (id: string) => ({ id, link: 'https://w1.zona.im/tvseries/' + id, title: id,
  poster: '', subtitle: '2024', type: FilmType.SERIES, externalIds: { kinopoisk: id } });

test('shows use website catalogs with available media and deduplicate genres and pages', async () => {
  const requests: string[] = [];
  const load = createZonaShowsCatalog(async (link, page, options) => {
    requests.push(link);
    assert.equal(options?.onlyAvailable, true);
    assert.equal(options?.deferMetadata, true);
    assert.match(link, /^https:\/\/w1\.zona\.im\/(tvseries|movies)\/filter\/genre-/);
    return { films: [card('1'), ...(page === 2 ? [card('2')] : [])], totalPages: 2 };
  });
  const first = await load(1);
  assert.equal(first.films.length, 1);
  assert.equal(first.films[0].type, FilmType.TV_SHOW);
  assert.equal(first.films[0].contentTypePending, false);
  assert.deepEqual((await load(2)).films.map(item => item.id), ['2']);
  assert.equal((await load(3)).films.length, 0);
  assert.equal(requests.length, ZONA_SHOWS_CATALOGS.length * 2, 'exhausted catalogs are not requested again');
  assert.equal((await load(1)).films.length, 1, 'refresh resets page deduplication');
});

test('available-media gate excludes catalog-only records, trailers and restricted uploads', () => {
  assert.equal(isZonaWebAvailable({}), false);
  assert.equal(isZonaWebAvailable({ parts: 0 }), false);
  assert.equal(isZonaWebAvailable({ parts: 3 }), true);
  assert.equal(isZonaWebAvailable({ parts: 1, is_trailer: true }), false);
  assert.equal(isZonaWebAvailable({ parts: 1, statuses: { dmca: true } }), false);
  assert.equal(isZonaWebAvailable({ parts: 1, statuses: { memorandum: true } }), false);
  assert.equal(isZonaWebAvailable({ meta: { id: 1, media_id: 42 } }), true);
});

test('a failed website catalog does not suppress healthy shows', async () => {
  const load = createZonaShowsCatalog(async link => {
    if (link.includes('tok-shou')) throw Error('unavailable');
    return { films: [card('1')], totalPages: 1 };
  });
  assert.equal((await load(1)).films.length, 1);
});

test('desktop artwork uses Zona server and contributor supplements preserve HTTP playback', () => {
  assert.equal(zonaDesktopImage('5582628'), 'https://img1.zonapic.com/images/film_240/5582/5582628.jpg');
  assert.equal(zonaDesktopCard({ id: '5582628' }).poster, zonaDesktopImage('5582628'));
  const base: FilmInterface = { ...card('5582628'), voices: [], hasVoices: true, hasSeasons: true };
  const extra: FilmInterface = { ...base, catalogOnly: true, poster: zonaDesktopImage('5582628'),
    actors: [{ name: 'Actor', photo: 'actor.jpg', link: '/person' }] };
  const merged = supplementZonaDetails(base, extra);
  assert.equal(merged.catalogOnly, undefined, 'desktop metadata must not disable a website player');
  assert.equal(merged.voices, base.voices);
  assert.equal(merged.actors?.[0].name, 'Actor');
  assert.equal(merged.poster, extra.poster);
  assert.equal(supplementZonaDetails(base, { ...extra, externalIds: { kinopoisk: 'different' } }), base);
});