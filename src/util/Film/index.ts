import { FilmInterface } from 'Type/Film.interface';
import { subtitleFromFilm } from './subtitle';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { ContentSource } from '../../source/types/ContentSource';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { FilmType } from 'Type/FilmType.type';
import { getRegisteredUnifiedFilm } from '../../source/search/UnifiedFilmRegistry';

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
  id: film.libraryId ?? film.id,
  link: film.link,
  type: film.type,
  poster: film.poster,
  title: film.title,
  subtitle: subtitleFromFilm(film),
  info: film.seriesInfo,
  originalTitle: film.originalTitle,
  externalIds: film.externalIds,
  sources: getRegisteredUnifiedFilm(film.link)?.sources,
  ratingSourceType: film.metadataSourceFilm ? ContentSource.REZKA
    : film.link.startsWith('https://anixart-app.com/release/') ? ContentSource.ANIXART
    : /^https?:\/\/[^/]*\.zona\.im\//.test(film.link) ? ContentSource.ZONA : ContentSource.REZKA,
  ratingFilmId: film.metadataSourceFilm?.id
    ?? (/^https?:\/\/[^/]*\.zona\.im\//.test(film.link) ? film.link : film.id),
  ratings: film.ratings?.reduce<NonNullable<FilmCardInterface['ratings']>>((result, rating) => {
    if (rating.name === 'IMDb') result.imdb = rating.rating;
    if (rating.name === 'Кинопоиск') result.kinopoisk = rating.rating;
    return result;
  }, {}),
  isPendingRelease: film.isPendingRelease,
});
/** Legacy history records recover the rating source from their native URL. */
export const recentToFilmCard = (item: RecentItemInterface): FilmCardInterface => {
  const zona = /^https?:\/\/[^/]*\.zona\.im\//.test(item.link);
  return {
    ...item.filmCard,
    id: item.id,
    link: item.link,
    type: item.filmCard?.type ?? FilmType.FILM,
    poster: item.image,
    title: item.name,
    subtitle: item.date,
    info: item.info,
    ratingSourceType: item.filmCard?.ratingSourceType ?? (zona ? ContentSource.ZONA : undefined),
    ratingFilmId: item.filmCard?.ratingFilmId ?? (zona ? item.link : undefined),
  };
};