import { withTV } from 'Hooks/withTV';
import { useCallback, useMemo } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { calculateRows } from 'Util/List';
import { openFilm } from 'Util/Router';

import FilmListComponent from './FilmList.component';
import FilmListComponentTV from './FilmList.component.atv';
import { FilmListContainerProps, FilmListItem } from './FilmList.type';

export function FilmListContainer({
  data: initialData,
  numberOfColumns = 1,
  children,
  contentHeight,
}: FilmListContainerProps) {
  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film.link);
  }, []);

  const data = useMemo(() => {
    const items = initialData.reduce((acc, item) => {
      const rows = calculateRows(item.films, numberOfColumns).map<FilmListItem>((row) => ({
        index: -1,
        films: row,
      }));

      if (rows.length > 0) {
        rows[0].header = item.header;
      }

      acc.push(...rows);

      return acc;
    }, [] as FilmListItem[]);

    if (items.length > 0) {
      items[0].content = children;
    }

    return items.map((item, index) => ({
      ...item,
      index,
    }));
  }, [initialData]);

  const containerFunctions = {
    handleOnPress,
  };

  const containerProps = () => ({
    data,
    numberOfColumns,
    children,
    contentHeight,
  });

  return withTV(FilmListComponentTV, FilmListComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default FilmListContainer;
