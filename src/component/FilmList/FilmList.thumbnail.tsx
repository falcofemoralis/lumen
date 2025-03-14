import { calculateCardDimensions } from 'Component/FilmCard/FilmCard.style.atv';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS } from './FilmList.config';
import { ROW_GAP } from './FilmList.style';

export const FilmListThumbnail = () => {
  const { width } = calculateCardDimensions(NUMBER_OF_COLUMNS, scale(ROW_GAP));

  return (
    <View
      style={ {
        flexDirection: 'row',
        gap: scale(ROW_GAP),
      } }
    >
      { Array(NUMBER_OF_COLUMNS).fill(0).map((__, index) => (
        <FilmCardThumbnail
          // eslint-disable-next-line react/no-array-index-key
          key={ `film-list-thumb-col-${index}` }
          style={ { width } }
        />
      )) }
    </View>
  );
};
