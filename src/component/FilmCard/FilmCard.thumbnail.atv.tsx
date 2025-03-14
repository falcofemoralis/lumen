import Thumbnail from 'Component/Thumbnail';
import { StyleProp, View, ViewStyle } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmCard.style';
import { INFO_HEIGHT } from './FilmCard.style.atv';

export const FilmCardThumbnail = ({
  style,
}: {
  style?: StyleProp<ViewStyle>
}) => (
  <View
    style={ [
      styles.card,
      style,
    ] }
  >
    <View style={ [styles.posterWrapper, style] }>
      <Thumbnail
        style={ styles.poster }
        height="auto"
      />
    </View>
    <View style={ [styles.info, { gap: scale(8) }] }>
      <Thumbnail
        height={ INFO_HEIGHT / 4 }
        width="100%"
      />
      <Thumbnail
        height={ INFO_HEIGHT / 6 }
        width="50%"
      />
    </View>
  </View>
);
