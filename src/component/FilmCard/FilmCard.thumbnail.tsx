import Thumbnail from 'Component/Thumbnail';
import { StyleProp, View, ViewStyle } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmCard.style';

export const FilmCardThumbnail = ({
  style,
}: {
  style?: StyleProp<ViewStyle>
}) => (
  <View style={ [styles.card, { gap: scale(8) }, style] }>
    <Thumbnail style={ [styles.posterWrapper, styles.poster] } />
    <Thumbnail
      height={ scale(24) }
      width="100%"
    />
    <Thumbnail
      height={ scale(16) }
      width="50%"
    />
  </View>
);
