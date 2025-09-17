import { FilmInterface } from 'Type/Film.interface';

export const isBookmarked = (film: FilmInterface) => {
  const { bookmarks = [] } = film;

  return bookmarks.reduce((acc, bookmark) => acc || bookmark.isBookmarked || false, false);
};