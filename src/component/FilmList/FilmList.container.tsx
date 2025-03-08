/* eslint-disable no-plusplus */
import { withTV } from 'Hooks/withTV';
import { useCallback } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { openFilm } from 'Util/Router';

import FilmListComponent from './FilmList.component';
import FilmListComponentTV from './FilmList.component.atv';
import { FilmListContainerProps } from './FilmList.type';

export function FilmListContainer({
  data,
  offsetFromStart,
  numberOfColumns = 1,
  children,
}: FilmListContainerProps) {
  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film.link);
  }, []);

  const calculateRows = useCallback(<T, >(list: T[]) => {
    const columns: T[][] = Array.from({ length: numberOfColumns }, () => []);

    list.forEach((item, index) => {
      columns[index % numberOfColumns].push(item);
    });

    const rows: T[][] = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < columns[0].length; i++) {
      const row: T[] = [];
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < numberOfColumns; j++) {
        if (columns[j][i] !== undefined) {
          row.push(columns[j][i]);
        }
      }
      rows.push(row);
    }

    return rows;
  }, [numberOfColumns]);

  const containerFunctions = {
    handleOnPress,
    calculateRows,
  };

  const containerProps = () => ({
    data,
    offsetFromStart,
    numberOfColumns,
    children,
  });

  return withTV(FilmListComponentTV, FilmListComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default FilmListContainer;
