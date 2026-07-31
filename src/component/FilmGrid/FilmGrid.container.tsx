import { useNavigation } from '@react-navigation/native';
import { useConfigContext } from 'Context/ConfigContext';
import { useCallback, useRef, useState } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { noopFn } from 'Util/Function';
import { openFilm } from 'Util/Router';

import FilmGridComponent from './FilmGrid.component';
import FilmGridComponentTV from './FilmGrid.component.atv';
import { FilmGridContainerProps } from './FilmGrid.type';

export function FilmGridContainer({
  onNextLoad,
  ...props
}: FilmGridContainerProps) {
  const navigation = useNavigation();
  const { isTV, numberOfColumnsMobile, numberOfColumnsTV } = useConfigContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updatingStateRef = useRef(false);

  const numberOfColumns = isTV ? numberOfColumnsTV : numberOfColumnsMobile;

  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
  }, [navigation]);

  const loadNextPage = async (onLoading: (state: boolean) => void, isRefresh = false) => {
    if (!updatingStateRef.current) {
      updatingStateRef.current = true;

      onLoading(true);

      try {
        if (onNextLoad) {
          await onNextLoad(isRefresh);
        }
      } finally {
        onLoading(false);
        requestAnimationFrame(() => {
          setTimeout(() => {
            updatingStateRef.current = false;
          }, 50);
        });
      }
    }
  };

  const handleScrollEnd = async () => {
    loadNextPage(noopFn);
  };

  const handleRefresh = async () => {
    loadNextPage((state) => setIsRefreshing(state), true);
  };

  const containerProps = {
    numberOfColumns,
    isRefreshing,
    onNextLoad,
    handleOnPress,
    handleScrollEnd,
    handleRefresh,
    ...props,
  };

  return isTV ? <FilmGridComponentTV { ...containerProps } /> : <FilmGridComponent { ...containerProps } />;

}

export default FilmGridContainer;
