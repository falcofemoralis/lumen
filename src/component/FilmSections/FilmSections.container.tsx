import { useNavigation } from '@react-navigation/native';
import { useConfigContext } from 'Context/ConfigContext';
import { useCallback, useMemo } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { calculateRows } from 'Util/List';
import { openFilm } from 'Util/Router';

import FilmSectionsComponent from './FilmSections.component';
import FilmSectionsComponentTV from './FilmSections.component.atv';
import { THUMBNAILS_ROWS, THUMBNAILS_ROWS_TV } from './FilmSections.config';
import { FilmSectionsContainerProps, FilmSectionsData, FilmSectionsItem } from './FilmSections.type';

export function FilmSectionsContainer({
  data: initialData = [],
  children,
  contentHeight,
}: FilmSectionsContainerProps) {
  const navigation = useNavigation();
  const { isTV, numberOfColumnsTV, numberOfColumnsMobile } = useConfigContext();

  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
  }, [navigation]);

  const data = useMemo(() => {
    const columns = isTV ? numberOfColumnsTV : numberOfColumnsMobile;
    const thumbnailsPerRow = isTV ? THUMBNAILS_ROWS_TV : THUMBNAILS_ROWS;

    const items = (initialData.length > 0 ? initialData : (new Array(1).fill({
      header: '',
      films: (new Array(columns * thumbnailsPerRow).fill(null).map((_, index) => ({
        id: `film-section-placeholder-${index}`,
        index,
      }))),
      isPlaceholder: true,
    })) as FilmSectionsData[]).reduce((acc, item) => {
      const rows = calculateRows(item.films, columns).map<FilmSectionsItem>((row) => ({
        index: -1,
        films: row,
      }));

      if (rows.length > 0) {
        rows[0].header = item.header;
      }

      if (item.isPlaceholder) {
        acc.push(...(rows.map((row) => ({ ...row, isPlaceholder: true }))));

        return acc;
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
  }, [initialData, children, isTV, numberOfColumnsTV, numberOfColumnsMobile]);

  const containerProps = {
    data,
    contentHeight,
    handleOnPress,
  };

  return isTV ? <FilmSectionsComponentTV { ...containerProps } /> : <FilmSectionsComponent { ...containerProps } />;

}

export default FilmSectionsContainer;
