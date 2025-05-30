import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

export const FilmCardThumbnail = ({
  width,
}: {
  width: number;
}) => (
  <View style={ [{ gap: scale(8) }, { width }] }>
    <Thumbnail height={ width * (250 / 166) } width={ width } />
    <Thumbnail
      height={ scale(24) }
      width={ width }
    />
    <Thumbnail
      height={ scale(16) }
      width={ width * 0.5 }
    />
  </View>
);
