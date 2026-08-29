import { useHiddenCountries, useIsTV } from 'Context/ConfigContext';
import { memo } from 'react';
import { isFilmCardHidden } from 'Util/Film';

import FilmCardComponent from './FilmCard.component';
import FilmCardComponentTV from './FilmCard.component.atv';
import { FilmCardContainerProps } from './FilmCard.type';

export function FilmCardContainer({ filmCard, ...props }: FilmCardContainerProps) {
  const isTV = useIsTV();
  const hiddenCountries = useHiddenCountries();

  // Resolved per card rather than once over the list: the country lives in the
  // card's own subtitle, and a list is never re-fetched when the setting changes.
  const isHidden = isFilmCardHidden(filmCard, hiddenCountries);

  const containerProps = { ...props, filmCard, isHidden };

  return isTV
    ? <FilmCardComponentTV { ...containerProps } />
    : <FilmCardComponent { ...containerProps } />;
}

export default memo(FilmCardContainer);
