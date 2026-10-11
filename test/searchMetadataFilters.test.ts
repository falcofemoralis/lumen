import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FilmType } from '../src/type/FilmType.type';
import { FilmInterface } from '../src/type/Film.interface';
import { buildFilmSubtitle, subtitleFromFilm } from '../src/util/Film/subtitle';
import { getGenreCatalogPath, matchesContentFilters } from '../src/source/search/ContentFilters';
import Anixart, { anixartToCard, anixartToFilm } from '../src/source/adapters/AnixartSourceAdapter';
import { SourceResolver } from '../src/source/resolver/SourceResolver';
import { createUnifiedSearchService } from '../src/source/search/UnifiedSearchService';

const film: FilmInterface = {
  id: '1', title: 'Пример', type: FilmType.FILM, link: 'link', poster: '',
  releaseDate: '2020', countries: [{ name: 'Япония' }, { name: 'США' }],
  genres: [{ name: 'комедия' }, { name: 'драма' }], voices: [], hasSeasons: false, hasVoices: false,
};
const filters = { includedCountries: [], excludedCountries: [] };
test('multiple genres match any selected genre, normalize category plurals and retain empty selection', () => {
  assert.equal(matchesContentFilters(film, { ...filters, genres: ['Комедии', 'Боевики'] }), true);
  assert.equal(matchesContentFilters(film, { ...filters, genres: ['Ужасы', 'Боевики'] }), false);
  assert.equal(matchesContentFilters(film, { ...filters, genres: [] }), true);
  assert.equal(matchesContentFilters({ ...film, genres: [{ name: 'экшен' }] }, { ...filters, genres: ['Боевики'] }), true);
});
test('countries default to unrestricted; unchecked coproductions and clearing every checkbox are excluded', () => {
  assert.equal(matchesContentFilters(film, filters), true);
  assert.equal(matchesContentFilters(film, { ...filters, allowedCountries: ['Япония', 'США'] }), true);
  assert.equal(matchesContentFilters(film, { ...filters, allowedCountries: ['Япония'], excludedCountries: ['США'] }), false);
  assert.equal(matchesContentFilters(film, { ...filters, allowedCountries: [] }), false);
  assert.equal(matchesContentFilters({ ...film, countries: [] }, filters), true);
  assert.equal(matchesContentFilters({ ...film, countries: [] }, { ...filters, allowedCountries: ['Япония'] }), false);
});
test('multiple genres use the category catalog rather than limiting the request to the first genre', () => {
  const options = [{ name: 'Все жанры', value: '/films/best/' }, { name: 'Комедии', value: '/films/comedy/' },
    { name: 'Драмы', value: '/films/drama/' }];
  assert.equal(getGenreCatalogPath(options, ['Комедии', 'Драмы']), '/films/');
  assert.equal(getGenreCatalogPath(options, ['Комедии']), '/films/comedy/');
  assert.equal(getGenreCatalogPath(options, []), '/films/');
});
test('poster subtitles combine available year, countries and genres, without blank or duplicate parts', () => {
  assert.equal(subtitleFromFilm(film), '2020, Япония, США, комедия, драма');
  assert.equal(buildFilmSubtitle(undefined, ['Япония', ''], ['комедия', ' Комедия ']), 'Япония, комедия');
});
const release = {
  id: 999907, title_ru: 'Тест', image: 'poster', year: '2020', country: 'Китай',
  genres: ' фэнтези, экшен, фэнтези, ', category: { id: 1, name: 'Сериал' },
};
test('Anixart genres survive native detail conversion and unified search rendering', async () => {
  const card = anixartToCard(release);
  assert.equal(card.subtitle, '2020, Китай, фэнтези, экшен');
  const detail = anixartToFilm(release);
  assert.deepEqual(detail.genres?.map(genre => genre.name), ['фэнтези', 'экшен']);
  assert.equal(detail.genres?.[0].link, 'https://anixart-app.com/catalog?genre=' + encodeURIComponent('фэнтези'));
  const adapter = { ...Anixart, search: async () => ({ films: [card], totalPages: 1 }) };
  const service = createUnifiedSearchService([adapter], new SourceResolver([adapter]));
  const result = await service.search('subtitle', 1);
  assert.equal(result.films[0].subtitle, card.subtitle);
  assert.equal(result.films[0].type, FilmType.DONGHUA);
});
test('deduplication supplements a year-only caption without removing sources or ratings', () => {
  const native = Anixart.normalizeFilmCard(anixartToCard(release));
  const incomplete = { ...native, subtitle: '2020', ratings: { imdb: 8 } };
  const merged = new SourceResolver([Anixart]).deduplicate([incomplete, native])[0];
  assert.equal(merged.subtitle, '2020, Китай, фэнтези, экшен');
  assert.equal(merged.ratings?.imdb, 8);
});

test('several selected formats match any chosen type; empty selection includes every type', () => {
  const base = { id: 'format', link: 'test', title: 'Test', poster: '', voices: [], hasVoices: false, hasSeasons: false };
  const filters = { types: [FilmType.FILM, FilmType.SERIES], includedCountries: [], excludedCountries: [] };
  assert.equal(matchesContentFilters({ ...base, type: FilmType.FILM }, filters), true);
  assert.equal(matchesContentFilters({ ...base, type: FilmType.SERIES }, filters), true);
  assert.equal(matchesContentFilters({ ...base, type: FilmType.ANIME }, filters), false);
  assert.equal(matchesContentFilters({ ...base, type: FilmType.DONGHUA }, { ...filters, types: [] }), true);
});