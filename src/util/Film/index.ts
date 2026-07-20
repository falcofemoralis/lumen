import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export const isBookmarked = (film: FilmInterface) => {
  const { bookmarks = [] } = film;

  return bookmarks.reduce((acc, bookmark) => acc || bookmark.isBookmarked || false, false);
};

export const filmToFilmCard = (film: FilmInterface): FilmCardInterface => ({
  id: film.id,
  link: film.link,
  type: film.type,
  poster: film.poster,
  title: film.title,
  subtitle: film.releaseDate ?? '',
});