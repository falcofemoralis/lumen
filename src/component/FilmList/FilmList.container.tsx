import { useNavigation } from '@react-navigation/native';
import { useConfigContext, useHiddenCountries } from 'Context/ConfigContext';
import { useCallback } from 'react';
import { isFilmCardHidden } from 'Util/Film';
import { openFilm } from 'Util/Router';

import FilmListComponent from './FilmList.component';
import FilmListComponentTV from './FilmList.component.atv';
import { FilmListContainerProps } from './FilmList.type';

export function FilmListContainer({
  items,
  onFilmPress,
  onNextLoad,
  ...props
}: FilmListContainerProps) {
  const { isTV } = useConfigContext();
  const navigation = useNavigation();
  const hiddenCountries = useHiddenCountries();

  const handleOnPress = useCallback((film: typeof items[number]['film']) => {
    if (isFilmCardHidden(film, hiddenCountries)) {
      return;
    }

    openFilm(film, navigation);
  }, [hiddenCountries, navigation]);

  const containerProps = {
    items,
    onFilmPress: onFilmPress ?? handleOnPress,
    onNextLoad,
    ...props,
  };

  return isTV
    ? <FilmListComponentTV { ...containerProps } />
    : <FilmListComponent { ...containerProps } />;
}

export default FilmListContainer;
