import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FilmType } from 'Type/FilmType.type';
import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { SourceRouter } from '../../src/source/resolver/SourceRouter';
import { SourceAdapter } from '../../src/source/types/SourceAdapter';
import { ContentSource } from '../../src/source/types/ContentSource';
import { UnifiedExternalIdType as Id } from '../../src/source/types/UnifiedFilm';
import { clearUnifiedFilmRegistry, getRegisteredUnifiedFilm, registerUnifiedFilm } from '../../src/source/search/UnifiedFilmRegistry';

const makeFilm = (zona: boolean, suffix = ''): FilmInterface => ({
  id: (zona ? 'shrek' : '123') + suffix,
  link: zona ? 'https://w1.zona.im/movies/shrek' + suffix : 'https://rezka.test/shrek' + suffix,
  title: 'Шрек', originalTitle: 'Shrek', releaseDate: '2001', type: FilmType.CARTOON,
  poster: zona ? 'zona-poster' : 'rezka-poster',
  voices: [], hasSeasons: false, hasVoices: false, externalIds: { kinopoisk: '430' },
  ratings: [{ name: 'IMDb', rating: 7.9, votes: zona ? undefined : 615, text: 'IMDb' }],
  actors: [{ name: 'Майк Майерс', photo: '', link: zona ? undefined : '/person/1' }],
  mainRating: { name: zona ? 'Zona' : 'Rezka', rating: 8, votes: 100, text: '8 (100)' },
});
const makeAdapter = (source: ContentSource, films: FilmInterface[]): SourceAdapter => {
  const normalize = (film: FilmInterface) => ({
    id: film.id, title: film.title, originalTitle: film.originalTitle, year: Number(film.releaseDate),
    type: film.type, poster: film.poster,
    sources: [{ source, link: film.link, nativeId: film.id, externalIds: film.externalIds?.kinopoisk
      ? [{ type: Id.KINOPOISK, value: film.externalIds.kinopoisk }] : [] }],
  });
  return {
    source, name: source, getFilm: async (link) => films.find((film) => film.link === link) ?? null,
    search: async () => ({ films: films.map((film) => ({
      ...film, subtitle: film.releaseDate!,
    })), totalPages: 1 }),
    normalizeFilm: normalize,
    normalizeFilmCard: (card) => normalize({ ...card, releaseDate: card.subtitle,
      voices: [], hasSeasons: false, hasVoices: false }),
    getExternalIds: (film) => normalize(film).sources[0].externalIds,
  };
};

test('Zona preference keeps library ID and supplements people and votes from matched Rezka', async () => {
  clearUnifiedFilmRegistry();
  const zona = { ...makeFilm(true), countries: [{ name: 'США' }], genres: [{ name: 'мультфильм' }] };
  const rezka = makeFilm(false);
  const z = makeAdapter(ContentSource.ZONA, [zona]);
  const r = makeAdapter(ContentSource.REZKA, [rezka]);
  let searches = 0;
  const search = z.search;
  z.search = (...args) => { searches++; return search(...args); };
  const router = new SourceRouter([z, r]);
  const preferred = await router.resolvePreferredFilm(rezka);
  assert.equal(preferred.link, zona.link);
  assert.equal(preferred.libraryId, rezka.id);
  assert.equal(preferred.metadataSourceFilm?.id, rezka.id);
  assert.equal(preferred.mainRating?.name, 'Zona');
  assert.equal(preferred.ratings?.[0].votes, 615);
  assert.equal(preferred.ratings?.find((rating) => rating.name === 'Rezka')?.votes, 100);
  assert.equal(preferred.actors?.[0].link, '/person/1');
  await router.resolvePreferredFilm(rezka);
  assert.equal(searches, 1);
  registerUnifiedFilm(z.normalizeFilm(zona));
  assert.equal(getRegisteredUnifiedFilm(zona.link)?.sources.length, 2);
  const card = await router.resolvePreferredCard({ ...rezka, subtitle: '2001' });
  assert.equal(card.id, rezka.id);
  assert.equal(card.subtitle, '2001, США, мультфильм');
  assert.equal(card.link, zona.link);
  assert.equal(card.ratingFilmId, zona.link);
});

test('conflicting external IDs, ambiguous matches and absent Zona keep Rezka', async () => {
  clearUnifiedFilmRegistry();
  const rezka = makeFilm(false, '-conflict');
  const zona = { ...makeFilm(true, '-conflict'), externalIds: { kinopoisk: '999' } };
  const r = makeAdapter(ContentSource.REZKA, [rezka]);
  const router = new SourceRouter([makeAdapter(ContentSource.ZONA, [zona]), r]);
  assert.equal((await router.resolvePreferredFilm(rezka)).link, rezka.link);
  const ambiguous = new SourceRouter([makeAdapter(ContentSource.ZONA, [
    makeFilm(true, '-a'), makeFilm(true, '-b'),
  ]), r]);
  assert.equal((await ambiguous.resolvePreferredFilm(rezka)).link, rezka.link);
  const absent = new SourceRouter([makeAdapter(ContentSource.ZONA, []), r]);
  assert.equal((await absent.resolvePreferredFilm(rezka)).link, rezka.link);
  const fallback = await absent.resolvePreferredCard({ ...rezka, subtitle: '2001' });
  assert.equal(fallback.ratings?.imdb, 7.9);
  assert.equal(fallback.ratingFilmId, rezka.id);
});

test('Zona-only metadata has no invented vote counts or supplemental source', async () => {
  clearUnifiedFilmRegistry();
  const zona = makeFilm(true, '-only');
  const router = new SourceRouter([makeAdapter(ContentSource.ZONA, [zona]), makeAdapter(ContentSource.REZKA, [])]);
  const result = await router.resolvePreferredFilm(zona);
  assert.equal(result.metadataSourceFilm, undefined);
  assert.equal(result.ratings?.[0].votes, undefined);
});

test('bookmark pending badge follows confirmed availability in native and matched sources', async () => {
  clearUnifiedFilmRegistry();
  const zona = { ...makeFilm(true, '-available'), isPendingRelease: false };
  const rezka = { ...makeFilm(false, '-available'), isPendingRelease: true };
  const router = new SourceRouter([makeAdapter(ContentSource.ZONA, [zona]), makeAdapter(ContentSource.REZKA, [rezka])]);
  const oldCard = { ...rezka, subtitle: '2001', isPendingRelease: true };
  assert.equal((await router.resolvePreferredCard(oldCard)).isPendingRelease, false);
  assert.equal((await router.resolvePreferredCard({ ...oldCard, link: zona.link })).isPendingRelease, false);
  const unknown = { ...zona, link: zona.link + '-unknown', isPendingRelease: undefined };
  const native = new SourceRouter([makeAdapter(ContentSource.ZONA, [unknown])]);
  assert.equal((await native.resolvePreferredCard({ ...oldCard, link: unknown.link })).isPendingRelease, true);
  const releasedRezka = { ...rezka, isPendingRelease: false };
  const fallback = new SourceRouter([makeAdapter(ContentSource.REZKA, [releasedRezka])]);
  assert.equal((await fallback.resolvePreferredCard(oldCard)).isPendingRelease, false);
});

test('matched primary card keeps supplemental episode status when primary metadata lacks it', async () => {
  clearUnifiedFilmRegistry();
  const zona = { ...makeFilm(true, '-episodes'), type: FilmType.SERIES };
  const rezka = { ...makeFilm(false, '-episodes'), type: FilmType.SERIES,
    seriesInfo: 'Сезон 2 • серия 7 • выходит' };
  const router = new SourceRouter([makeAdapter(ContentSource.ZONA, [zona]), makeAdapter(ContentSource.REZKA, [rezka])]);
  const result = await router.resolvePreferredCard({ ...rezka, subtitle: '2001', info: undefined });
  assert.equal(result.link, zona.link);
  assert.equal(result.info, rezka.seriesInfo);
});
test('bookmark migration checks stored metadata against Zona without loading Rezka first', async () => {
  clearUnifiedFilmRegistry();
  const rezka = makeFilm(false, '-fast-bookmark'), zona = makeFilm(true, '-fast-bookmark');
  const r = makeAdapter(ContentSource.REZKA, [rezka]);
  let rezkaRequests = 0;
  r.getFilm = async () => { rezkaRequests++; throw new Error('Must not load Rezka'); };
  const router = new SourceRouter([r, makeAdapter(ContentSource.ZONA, [zona])]);
  const result = await router.resolveBookmarkPrimary({ ...rezka, ratings: undefined, subtitle: '2001' });
  assert.equal(result?.link, zona.link);
  assert.equal(result?.poster, zona.poster);
  assert.equal(rezkaRequests, 0);
});
test('preferred Zona page restores franchise, schedule and related posters from a verified Rezka match', async () => {
  clearUnifiedFilmRegistry();
  const zona = makeFilm(true, '-sections');
  const rezka = { ...makeFilm(false, '-sections'),
    franchise: [{ name: 'Part 2', year: '2004', rating: '7', link: '/part2' }],
    schedule: [{ name: 'Season 1', items: [{ id: '1', name: '1', episodeName: 'Episode', date: '2026-01-01' }] }],
    related: [{ id: 'related', link: '/related', title: 'Related', poster: 'https://img.test/related.jpg', type: FilmType.FILM, subtitle: '2020' }],
  };
  const router = new SourceRouter([makeAdapter(ContentSource.ZONA, [zona]), makeAdapter(ContentSource.REZKA, [rezka])]);
  const enriched = await router.resolvePreferredFilm(rezka);
  assert.equal(enriched.link, zona.link);
  assert.deepEqual(enriched.franchise, rezka.franchise);
  assert.deepEqual(enriched.schedule, rezka.schedule);
  assert.equal(enriched.related?.[0].poster, rezka.related[0].poster);
  const native = { ...zona, franchise: [{ name: 'Native', year: '2001', rating: '8', link: '' }], schedule: rezka.schedule, related: rezka.related };
  const nativeRouter = new SourceRouter([makeAdapter(ContentSource.ZONA, [native]), makeAdapter(ContentSource.REZKA, [rezka])]);
  assert.equal((await nativeRouter.resolvePreferredFilm(rezka)).franchise?.[0].name, 'Native');
});
test('unknown Zona series completion is supplemented from verified Rezka without replacing season and episode', async () => {
  clearUnifiedFilmRegistry();
  const zona = { ...makeFilm(true, '-completion'), type: FilmType.SERIES, hasSeasons: true, seriesInfo: 'Сезон 6 • серия 13' };
  const rezka = { ...makeFilm(false, '-completion'), type: FilmType.SERIES, hasSeasons: true, seriesInfo: '6 сезон, 13 серия, сериал завершён' };
  const router = new SourceRouter([makeAdapter(ContentSource.ZONA, [zona]), makeAdapter(ContentSource.REZKA, [rezka])]);
  const result = await router.resolvePreferredCard({ ...zona, ratings: undefined, subtitle: '2001' }, true);
  assert.equal(result.info, 'Сезон 6 • серия 13 • завершён');
  assert.equal(result.link, zona.link);
});