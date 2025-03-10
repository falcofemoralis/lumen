/* eslint-disable no-plusplus */
import { withTV } from 'Hooks/withTV';
import { useCallback } from 'react';
import ConfigStore from 'Store/Config.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { openFilm } from 'Util/Router';

import FilmGridComponent from './FilmGrid.component';
import GridComponentTV from './FilmGrid.component.atv';
import {
  NUMBER_OF_COLUMNS,
  NUMBER_OF_COLUMNS_TV,
  THUMBNAILS_AMOUNT,
  THUMBNAILS_AMOUNT_TV,
} from './FilmGrid.config';
import { FilmGridContainerProps, FilmGridItemType } from './FilmGrid.type';

export function FilmGridContainer({
  films,
  header,
  headerSize,
  onNextLoad,
  onItemFocus,
}: FilmGridContainerProps) {
  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film.link);
  }, []);

  const handleItemFocus = (index: number) => {
    if (onItemFocus) {
      const numberOfColumns = ConfigStore.isTV ? NUMBER_OF_COLUMNS_TV : NUMBER_OF_COLUMNS;

      onItemFocus(Math.floor(index / numberOfColumns));
    }
  };

  const getFilms = (): FilmGridItemType[] => {
    if (!films.length) {
      return Array(ConfigStore.isTV ? THUMBNAILS_AMOUNT_TV : THUMBNAILS_AMOUNT).fill({
        id: '',
        link: '',
        type: FilmType.FILM,
        poster: '',
        title: '',
        subtitle: '',
        isThumbnail: true,
      }) as FilmCardInterface[];
    }

    return films;
  };

  const containerFunctions = {
    handleOnPress,
    handleItemFocus,
  };

  const containerProps = () => ({
    films: getFilms(),
    header,
    headerSize,
    onNextLoad,
  });

  return withTV(GridComponentTV, FilmGridComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default FilmGridContainer;
