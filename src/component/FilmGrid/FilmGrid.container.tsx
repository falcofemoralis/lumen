import { useNavigation } from '@react-navigation/native';
import { withTV } from 'Hooks/withTV';
import { useCallback, useMemo } from 'react';
import { useMMKVString } from 'react-native-mmkv';
import ConfigStore, { DEVICE_CONFIG } from 'Store/Config.store';
import StorageStore from 'Store/Storage.store';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { openFilm } from 'Util/Router';

import FilmGridComponent from './FilmGrid.component';
import GridComponentTV from './FilmGrid.component.atv';
import { FilmGridContainerProps } from './FilmGrid.type';

export function FilmGridContainer({
  films,
  header,
  headerSize,
  onNextLoad,
  onItemFocus,
}: FilmGridContainerProps) {
  const navigation = useNavigation();
  const [configJson] = useMMKVString(DEVICE_CONFIG, StorageStore.getConfigStorage());
  const numberOfColumns = useMemo(() => {
    const { numberOfColumnsTV, numberOfColumnsMobile } = ConfigStore.parseConfig(configJson || '');

    return ConfigStore.isTV() ? numberOfColumnsTV : numberOfColumnsMobile;
  }, [configJson]);

  const handleOnPress = useCallback((film: FilmCardInterface) => {
    openFilm(film, navigation);
  }, [navigation]);

  const handleItemFocus = useCallback((index: number) => {
    if (onItemFocus) {
      onItemFocus(Math.floor(index / numberOfColumns));
    }
  }, [onItemFocus, numberOfColumns]);

  const containerFunctions = {
    handleOnPress,
    handleItemFocus,
  };

  const containerProps = () => ({
    films,
    header,
    headerSize,
    numberOfColumns,
    onNextLoad,
  });

  return withTV(GridComponentTV, FilmGridComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default FilmGridContainer;
