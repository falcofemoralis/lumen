import { withTV } from 'Hooks/withTV';
import { useCallback } from 'react';
import ConfigStore from 'Store/Config.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { openFilm } from 'Util/Router';

import FilmGridComponent from './FilmGrid.component';
import GridComponentTV from './FilmGrid.component.atv';
import {
  NUMBER_OF_COLUMNS,
  NUMBER_OF_COLUMNS_TV,
} from './FilmGrid.config';
import { FilmGridContainerProps } from './FilmGrid.type';

export function FilmGridContainer({
  films,
  header,
  headerSize,
  onNextLoad,
  onItemFocus,
}: FilmGridContainerProps) {
  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film);
  }, []);

  const handleItemFocus = (index: number) => {
    if (onItemFocus) {
      const numberOfColumns = ConfigStore.isTV() ? NUMBER_OF_COLUMNS_TV : NUMBER_OF_COLUMNS;

      onItemFocus(Math.floor(index / numberOfColumns));
    }
  };

  const containerFunctions = {
    handleOnPress,
    handleItemFocus,
  };

  const containerProps = () => ({
    films,
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
