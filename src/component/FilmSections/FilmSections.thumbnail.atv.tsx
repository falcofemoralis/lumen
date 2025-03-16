import { calculateCardDimensions } from 'Component/FilmCard/FilmCard.style.atv';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS_TV } from './FilmSections.config';
import { ROW_GAP } from './FilmSections.style.atv';

export const FilmSectionsThumbnail = () => {
  const { width } = calculateCardDimensions(
    NUMBER_OF_COLUMNS_TV,
    scale(ROW_GAP),
    scale(ROW_GAP) * 2,
  );

  return (
    <View
      style={ {
        flexDirection: 'row',
        gap: scale(ROW_GAP),
      } }
    >
      { Array(NUMBER_OF_COLUMNS_TV).fill(0).map((_, index) => (
        <FilmCardThumbnail
          // eslint-disable-next-line react/no-array-index-key
          key={ `film-list-thumb-col-${index}` }
          style={ { width } }
        />
      )) }
    </View>
  );
};
