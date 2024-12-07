import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useCallback, useEffect, useRef, useState } from 'react';
import ConfigStore from 'Store/Config.store';
import FilmCardInterface from 'Type/FilmCard.interface';
import GridComponent from './FilmGrid.component';
import GridComponentTV from './FilmGrid.component.atv';
import { DEFAULT_PAGE, NUMBER_OF_COLUMNS, NUMBER_OF_COLUMNS_TV } from './FilmGrid.config';
import { FilmGridContainerProps, FilmGridPaginationInterface } from './FilmGrid.type';

export function GridContainer(props: FilmGridContainerProps) {
  const { films, onNextLoad } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updatingStateRef = useRef(false);
  const paginationRef = useRef<FilmGridPaginationInterface>({
    currentPage: DEFAULT_PAGE,
    totalPages: DEFAULT_PAGE,
  });

  useEffect(() => {
    console.log('useEffect');

    onNextLoad(paginationRef.current).then((pagination) => {
      paginationRef.current = {
        ...pagination,
      };
    });
  }, []);

  const calculateRows = () => {
    const numberOfColumns = ConfigStore.isTV ? NUMBER_OF_COLUMNS_TV : NUMBER_OF_COLUMNS;

    const columns: FilmCardInterface[][] = Array.from({ length: numberOfColumns }, () => []);

    films.forEach((film, index) => {
      columns[index % numberOfColumns].push(film);
    });

    // Now group the columns into rows
    const rows: FilmCardInterface[][] = [];
    for (let i = 0; i < columns[0].length; i++) {
      const row: FilmCardInterface[] = [];
      for (let j = 0; j < numberOfColumns; j++) {
        if (columns[j][i] !== undefined) {
          row.push(columns[j][i]);
        }
      }
      rows.push(row);
    }

    return rows;
  };

  const handleOnPress = useCallback((film: FilmCardInterface) => {
    console.log('handleOnPress');

    router.push({
      pathname: '/film/[link]',
      params: {
        link: film.link,
      },
    });
  }, []);

  const loadNextPage = async (onLoading: (state: boolean) => void, isRefresh: boolean = false) => {
    console.trace();

    const { currentPage, totalPages } = paginationRef.current;

    const newPage = !isRefresh ? currentPage + 1 : DEFAULT_PAGE;

    if (newPage < totalPages && !updatingStateRef.current) {
      updatingStateRef.current = true;
      onLoading(true);

      try {
        const newPagination = await onNextLoad(
          {
            totalPages,
            currentPage: newPage,
          },
          isRefresh
        );

        paginationRef.current = {
          ...newPagination,
        };
      } finally {
        updatingStateRef.current = false;
        onLoading(false);
      }
    }
  };

  const onScrollEnd = async () => {
    loadNextPage((state) => setIsLoading(state));
  };

  const onRefresh = async () => {
    loadNextPage((state) => setIsRefreshing(state), true);
  };

  const containerFunctions = {
    handleOnPress,
    onScrollEnd,
  };

  const containerProps = () => {
    return {
      films,
      rows: calculateRows(),
      isRefreshing,
      onRefresh,
    };
  };

  return withTV(GridComponentTV, GridComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default GridContainer;
