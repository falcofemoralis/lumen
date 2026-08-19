import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';

export const isBookmarked = (film: FilmInterface) => {
  const { bookmarks = [] } = film;

  return bookmarks.reduce((acc, bookmark) => acc || bookmark.isBookmarked || false, false);
};

/**
 * A listing card carries its country nowhere but in the subtitle, which the site
 * writes as a comma separated `<year>, <country>, <genre>` line - so the parts are
 * simply split back apart.
 */
export const parseFilmCardParts = (subtitle: string): string[] => subtitle
  .split(',')
  .map((part) => part.trim().toLowerCase())
  .filter(Boolean);

/**
 * Whether the card belongs to one of the countries the user chose to hide.
 *
 * `hiddenCountries` is expected lowercased -- see `useHiddenCountries`. The parts
 * are compared whole rather than searched for: "россия" is a substring of
 * "белоруссия", so a `includes` test would hide the wrong films.
 */
export const isFilmCardHidden = (
  film: FilmCardInterface,
  hiddenCountries: Set<string>
): boolean => {
  if (!hiddenCountries.size || !film.subtitle) {
    return false;
  }

  return parseFilmCardParts(film.subtitle).some((part) => hiddenCountries.has(part));
};

export const filmToFilmCard = (film: FilmInterface): FilmCardInterface => ({
  id: film.id,
  link: film.link,
  type: film.type,
  poster: film.poster,
  title: film.title,
  subtitle: film.releaseDate ?? '',
});