import { useNavigation } from '@react-navigation/native';
import { useConfigContext } from 'Context/ConfigContext';
import { useCallback } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { openFilm } from 'Util/Router';

import FilmGridComponent from './FilmGrid.component';
import FilmGridComponentTV from './FilmGrid.component.atv';
import { FilmGridContainerProps } from './FilmGrid.type';

export function FilmGridContainer({
  films,
  isGridVisible,
  isEmpty,
  ListHeaderComponent,
  ListEmptyComponent,
  isAddSafeArea,
  menuDefaultFocus,
  onNextLoad,
  onItemFocus,
}: FilmGridContainerProps) {
  const navigation = useNavigation();
  const { isTV, numberOfColumnsMobile, numberOfColumnsTV } = useConfigContext();

  const numberOfColumns = isTV ? numberOfColumnsTV : numberOfColumnsMobile;

  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
  }, [navigation]);

  const handleItemFocus = useCallback((index: number) => {
    if (onItemFocus) {
      onItemFocus(Math.floor(index / numberOfColumns));
    }
  }, [onItemFocus, numberOfColumns]);

  const containerProps = {
    films,
    numberOfColumns,
    isGridVisible,
    isEmpty,
    isAddSafeArea,
    menuDefaultFocus,
    ListHeaderComponent,
    ListEmptyComponent,
    onNextLoad,
    handleOnPress,
    handleItemFocus,
  };

  return isTV ? <FilmGridComponentTV { ...containerProps } /> : <FilmGridComponent { ...containerProps } />;

}

export default FilmGridContainer;
