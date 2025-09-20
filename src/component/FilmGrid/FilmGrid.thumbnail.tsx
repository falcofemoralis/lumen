import { useFilmCardDimensions } from 'Component/FilmCard/FilmCard.style';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { THUMBNAILS_ROWS } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style';

export const FilmGridThumbnail = ({ numberOfColumns }: { numberOfColumns: number }) => {
  const { width } = useFilmCardDimensions(numberOfColumns, scale(ROW_GAP));

  return (
    <View style={ styles.grid }>
      { Array(THUMBNAILS_ROWS).fill(0).map((_, index) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={ `film-grid-thumb-row-${index}` }
          style={ styles.gridRow }
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
