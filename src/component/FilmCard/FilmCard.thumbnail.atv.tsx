import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { INFO_HEIGHT } from './FilmCard.style.atv';

export const FilmCardThumbnail = ({
  width,
}: {
  width: number;
}) => (
  <View style={ [{ gap: scale(8) }, { width }] }>
    <Thumbnail
      height={ width * (250 / 166) }
      width={ width }
      style={ { borderRadius: 0 } }
    />
    <Thumbnail
      height={ scale(INFO_HEIGHT / 4) }
      width={ width }
      style={ { borderRadius: 0 } }
    />
    <Thumbnail
      height={ scale(INFO_HEIGHT / 6) }
      width={ width * 0.5 }
      style={ { borderRadius: 0 } }
    />
  </View>
);
