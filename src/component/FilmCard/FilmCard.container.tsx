import { useHiddenCountries, useIsTV } from 'Context/ConfigContext';
import { memo } from 'react';
import { isFilmCardHidden } from 'Util/Film';
import { useBookmarkLibrary } from 'Hooks/useBookmarkLibrary';
import { matchingBookmarkIds } from 'Util/LocalLibrary/identity';

import FilmCardComponent from './FilmCard.component';
import FilmCardComponentTV from './FilmCard.component.atv';
import { FilmCardContainerProps } from './FilmCard.type';

export function FilmCardContainer({ filmCard, ...props }: FilmCardContainerProps) {
  const isTV = useIsTV();
  const hiddenCountries = useHiddenCountries();

  // Resolved per card rather than once over the list: the country lives in the
  // card's own subtitle, and a list is never re-fetched when the setting changes.
  const isHidden = isFilmCardHidden(filmCard, hiddenCountries);

  const bookmarks = useBookmarkLibrary();
  const matches = new Set(matchingBookmarkIds(bookmarks, filmCard));
  const isBookmarked = bookmarks.categories.some(category => category.filmIds.some(id => matches.has(id)));
  const containerProps = { ...props, filmCard, isHidden, isBookmarked };

  return isTV
    ? <FilmCardComponentTV { ...containerProps } />
    : <FilmCardComponent { ...containerProps } />;
}

export default memo(FilmCardContainer);
