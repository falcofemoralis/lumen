import { useFilmCardDimensions } from 'Component/FilmCard/FilmCard.style';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS, THUMBNAILS_AMOUNT } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style';

export const FilmGridThumbnail = () => {
  const { width } = useFilmCardDimensions(NUMBER_OF_COLUMNS, scale(ROW_GAP));

  return (
    <View style={ styles.grid }>
      { Array(THUMBNAILS_AMOUNT).fill(0).map((_, index) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={ `film-grid-thumb-row-${index}` }
          style={ styles.gridRow }
        >
          { Array(NUMBER_OF_COLUMNS).fill(0).map((__, innerIndex) => (
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
