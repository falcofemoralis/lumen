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
  const zona = makeFilm(true);
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
  assert.equal(card.link, zona.link);
  assert.equal(card.ratingFilmId, rezka.id);
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