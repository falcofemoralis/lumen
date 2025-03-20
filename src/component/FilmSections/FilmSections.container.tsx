import { withTV } from 'Hooks/withTV';
import { useCallback, useMemo } from 'react';
import ConfigStore from 'Store/Config.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { calculateRows } from 'Util/List';
import { openFilm } from 'Util/Router';

import FilmSectionsComponent from './FilmSections.component';
import FilmSectionsComponentTV from './FilmSections.component.atv';
import { NUMBER_OF_COLUMNS, NUMBER_OF_COLUMNS_TV } from './FilmSections.config';
import { FilmSectionsContainerProps, FilmSectionsItem } from './FilmSections.type';

export function FilmSectionsContainer({
  data: initialData,
  children,
  contentHeight,
}: FilmSectionsContainerProps) {
  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film.link);
  }, []);

  const data = useMemo(() => {
    const columns = ConfigStore.isTV() ? NUMBER_OF_COLUMNS_TV : NUMBER_OF_COLUMNS;
    const items = initialData.reduce((acc, item) => {
      const rows = calculateRows(item.films, columns).map<FilmSectionsItem>((row) => ({
        index: -1,
        films: row,
      }));

      if (rows.length > 0) {
        rows[0].header = item.header;
      }

      acc.push(...rows);

      return acc;
    }, [] as FilmSectionsItem[]);

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
    children,
    contentHeight,
  });

  return withTV(FilmSectionsComponentTV, FilmSectionsComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default FilmSectionsContainer;
