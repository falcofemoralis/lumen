import { calculateCardDimensions } from 'Component/FilmCard/FilmCard.style.atv';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS_TV, THUMBNAILS_AMOUNT_TV } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style.atv';

export const FilmGridThumbnail = () => {
  const { width } = calculateCardDimensions(
    NUMBER_OF_COLUMNS_TV,
    scale(ROW_GAP),
    scale(ROW_GAP) * 2,
  );

  return (
    <View style={ [styles.grid, { gap: scale(ROW_GAP) * 4 }] }>
      { Array(THUMBNAILS_AMOUNT_TV).fill(0).map((_, index) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={ `film-grid-thumb-row-${index}` }
          style={ styles.rowStyle }
        >
          { Array(NUMBER_OF_COLUMNS_TV).fill(0).map((__, innerIndex) => (
            <FilmCardThumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `film-grid-thumb-row-${index}-col-${innerIndex}` }
              style={ { width } }
            />
          )) }
        </View>
      )) }
    </View>
  );
};
