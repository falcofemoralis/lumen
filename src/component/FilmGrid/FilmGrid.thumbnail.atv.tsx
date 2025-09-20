import { calculateCardDimensions } from 'Component/FilmCard/FilmCard.style.atv';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useMMKVString } from 'react-native-mmkv';
import ConfigStore, { DEVICE_CONFIG } from 'Store/Config.store';
import StorageStore from 'Store/Storage.store';
import { scale } from 'Util/CreateStyles';

import { THUMBNAILS_ROWS_TV } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style.atv';

export const FilmGridThumbnail = () => {
  const [configJson] = useMMKVString(DEVICE_CONFIG, StorageStore.getConfigStorage());
  const numberOfColumns = useMemo(() => {
    const { numberOfColumnsTV, numberOfColumnsMobile } = ConfigStore.parseConfig(configJson || '');

    return ConfigStore.isTV() ? numberOfColumnsTV : numberOfColumnsMobile;
  }, [configJson]);
  const { width } = calculateCardDimensions(
    numberOfColumns,
    scale(ROW_GAP),
    scale(ROW_GAP) * 2
  );

  return (
    <View style={ [styles.grid, { gap: scale(ROW_GAP) * 4 }] }>
      { Array(THUMBNAILS_ROWS_TV).fill(0).map((_, index) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={ `film-grid-thumb-row-${index}` }
          style={ styles.rowStyle }
        >
          { Array(numberOfColumns).fill(0).map((__, innerIndex) => (
            <FilmCardThumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `film-grid-thumb-row-${index}-col-${innerIndex}` }
              width={ width }
            />
          )) }
        </View>
      )) }
    </View>
  );
};
