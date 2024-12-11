import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useCallback, useEffect, useRef, useState } from 'react';
import ConfigStore from 'Store/Config.store';
import FilmCardInterface from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import GridComponent from './FilmGrid.component';
import GridComponentTV from './FilmGrid.component.atv';
import {
  DEFAULT_PAGE,
  NUMBER_OF_COLUMNS,
  NUMBER_OF_COLUMNS_TV,
  THUMBNAILS_AMOUNT,
  THUMBNAILS_AMOUNT_TV,
} from './FilmGrid.config';
import { FilmGridContainerProps, FilmGridItem, FilmGridPaginationInterface } from './FilmGrid.type';
import { noopFn } from 'Util/Function';

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
    onNextLoad(paginationRef.current).then((pagination) => {
      paginationRef.current = {
        ...pagination,
      };
    });
  }, []);

  const getFilms = (): FilmGridItem[] => {
    if (!films.length) {
      return Array(ConfigStore.isTV ? THUMBNAILS_AMOUNT_TV : THUMBNAILS_AMOUNT).fill({
        id: '',
        link: '',
        type: FilmType.Film,
        poster: '',
        title: '',
        subtitle: '',
        isThumbnail: true,
      });
    }

    return films;
  };

  const calculateRows = () => {
    const numberOfColumns = ConfigStore.isTV ? NUMBER_OF_COLUMNS_TV : NUMBER_OF_COLUMNS;

    const columns: FilmCardInterface[][] = Array.from({ length: numberOfColumns }, () => []);

    getFilms().forEach((film, index) => {
      columns[index % numberOfColumns].push(film);
    });

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
    router.push({
      pathname: '/film/[link]',
      params: {
        link: film.link,
      },
    });
  }, []);

  const loadNextPage = async (onLoading: (state: boolean) => void, isRefresh: boolean = false) => {
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
          isRefresh,
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
    loadNextPage(noopFn);
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
      films: getFilms(),
      rows: !ConfigStore.isTV ? calculateRows() : [], // TV version do not use rows
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
