import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseZonaRelations, supplementZonaDetails } from '../src/source/adapters/ZonaDesktopCatalog';
import type { FilmInterface } from '../src/type/Film.interface';
import { FilmType } from '../src/type/FilmType.type';

test('Zona recommendations honor relation type, direction and ordering', () => {
  assert.deepEqual(parseZonaRelations({ id: '1', rels: JSON.stringify([
    { mi: 1, rmi: 2, r: 0, p: 2 }, { mi: 3, rmi: 1, r: 0, p: 1 },
    { mi: 1, rmi: 4, r: 3, p: 0 }, { mi: 1, rmi: 1, r: 0 }, { mi: 1, rmi: 'bad', r: 0 },
  ]) }), ['3', '2']);
  assert.deepEqual(parseZonaRelations({ id: '1', rels: '{}' }), []);
});
test('Zona supplements existing names with native person links and recommendations', () => {
  const film: FilmInterface = { id: '1', title: 'Test', link: 'https://w1.zona.im/movies/test',
    poster: '', type: FilmType.FILM, voices: [], hasSeasons: false, hasVoices: false,
    externalIds: { kinopoisk: '1' }, actors: [{ name: 'Actor', photo: '' }] };
  const related = [{ ...film, subtitle: '2020', id: '2' }];
  const merged = supplementZonaDetails(film, { ...film, catalogOnly: true, related,
    actors: [{ name: 'Actor', photo: 'photo', link: 'https://w1.zona.im/catalog?person=42' }] });
  assert.equal(merged.actors?.[0].link, 'https://w1.zona.im/catalog?person=42');
  assert.equal(merged.related, related);
  assert.equal(merged.catalogOnly, undefined);
});
