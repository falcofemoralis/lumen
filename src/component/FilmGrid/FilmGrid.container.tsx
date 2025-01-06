/* eslint-disable no-plusplus */
import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { useCallback, useRef, useState } from 'react';
import ConfigStore from 'Store/Config.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { noopFn } from 'Util/Function';

import FilmGridComponent from './FilmGrid.component';
import GridComponentTV from './FilmGrid.component.atv';
import {
  NUMBER_OF_COLUMNS,
  NUMBER_OF_COLUMNS_TV,
  THUMBNAILS_AMOUNT,
  THUMBNAILS_AMOUNT_TV,
} from './FilmGrid.config';
import { FilmGridContainerProps, FilmGridItem } from './FilmGrid.type';

export function FilmGridContainer({
  films,
  pagination,
  onNextLoad,
}: FilmGridContainerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updatingStateRef = useRef(false);

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

    const columns: FilmGridItem[][] = Array.from({ length: numberOfColumns }, () => []);

    getFilms().forEach((film, index) => {
      columns[index % numberOfColumns].push(film);
    });

    const rows: FilmGridItem[][] = [];
    for (let i = 0; i < columns[0].length; i++) {
      const row: FilmGridItem[] = [];
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
    router.navigate({
      pathname: '/film/[link]',
      params: {
        link: film.link,
      },
    });
  }, []);

  const loadNextPage = async (onLoading: (state: boolean) => void, isRefresh = false) => {
    const { currentPage, totalPages } = pagination;

    const newPage = !isRefresh ? currentPage + 1 : 1;

    if (!updatingStateRef.current) {
      updatingStateRef.current = true;
      onLoading(true);

      try {
        await onNextLoad(
          {
            totalPages,
            currentPage: newPage,
          },
          isRefresh,
          isRefresh,
        );
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

  const containerProps = () => ({
    films: getFilms(),
    rows: !ConfigStore.isTV ? calculateRows() : [], // TV version do not use rows
    isRefreshing,
    onRefresh,
  });

  return withTV(GridComponentTV, FilmGridComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default FilmGridContainer;
