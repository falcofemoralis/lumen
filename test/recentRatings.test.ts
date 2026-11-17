import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filmToFilmCard, recentToFilmCard } from '../src/util/Film';
import { FilmType } from '../src/type/FilmType.type';
import { ContentSource } from '../src/source/types/ContentSource';
import { FilmInterface } from '../src/type/Film.interface';

const recent = { id: 'shrek', link: 'https://w1.zona.im/movies/shrek', image: 'poster', name: 'Шрек', date: 'Today', isWatched: false };
test('legacy Zona history requests ratings by Zona URL instead of the active Rezka service', () => {
  const card = recentToFilmCard(recent);
  assert.equal(card.ratingSourceType, ContentSource.ZONA);
  assert.equal(card.ratingFilmId, recent.link);
  assert.equal(recentToFilmCard({ ...recent, link: 'https://rezka.test/film' }).ratingSourceType, undefined);
});
test('saved history preserves external ratings and supplemental source after JSON persistence', () => {
  const film: FilmInterface = {
    id: 'shrek', link: recent.link, poster: 'poster', title: 'Шрек', type: FilmType.CARTOON,
    voices: [], hasVoices: false, hasSeasons: false,
    ratings: [{ name: 'IMDb', rating: 7.9, text: 'IMDb' }, { name: 'Кинопоиск', rating: 8.2, text: 'Кинопоиск' }],
  };
  const restored = JSON.parse(JSON.stringify({ ...recent, filmCard: filmToFilmCard(film) }));
  const card = recentToFilmCard(restored);
  assert.deepEqual(card.ratings, { imdb: 7.9, kinopoisk: 8.2 });
  assert.equal(card.type, FilmType.CARTOON);
  assert.equal(card.id, recent.id);
  assert.equal(card.ratingSourceType, ContentSource.ZONA);
  const supplemented = recentToFilmCard({ ...recent, filmCard: { ...card, ratingSourceType: ContentSource.REZKA, ratingFilmId: '123' } });
  assert.equal(supplemented.ratingFilmId, '123');
  assert.equal(supplemented.ratingSourceType, ContentSource.REZKA);
});