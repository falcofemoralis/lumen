import { useHiddenCountries, useIsTV } from 'Context/ConfigContext';
import { useCallback } from 'react';
import { FilmInterface } from 'Type/Film.interface';
import { isFilmCardHidden } from 'Util/Film';

import FilmViewRelatedItemComponent from './FilmViewRelatedItem.component';
import FilmViewRelatedItemComponentTV from './FilmViewRelatedItem.component.atv';
import { FilmViewRelatedItemContainerProps } from './FilmViewRelatedItem.type';

export function FilmViewRelatedItemContainer({
  item,
  handleSelectFilm,
}: FilmViewRelatedItemContainerProps) {
  const isTV = useIsTV();
  const hiddenCountries = useHiddenCountries();

  // The card itself is covered up by `FilmCard`; this keeps the film it covers
  // from being opened anyway.
  const handleOnSelect = useCallback((film: FilmInterface) => {
    if (isFilmCardHidden(item, hiddenCountries)) {
      return;
    }

    handleSelectFilm(film);
  }, [item, hiddenCountries, handleSelectFilm]);

  const containerProps = {
    item,
    handleSelectFilm: handleOnSelect,
  };

  return isTV
    ? <FilmViewRelatedItemComponentTV { ...containerProps } />
    : <FilmViewRelatedItemComponent { ...containerProps } />;
}

export default FilmViewRelatedItemContainer;
