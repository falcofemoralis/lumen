import { FilmGridThumbnail } from 'Component/FilmGrid/FilmGrid.thumbnail';
import Loader from 'Component/Loader';
import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

export const BookmarksPageThumbnail = () => (
  <View style={ {
    width: '100%',
    height: '100%',
  } }
  >
    <View
      style={ {
        flexDirection: 'row',
        height: scale(24),
        gap: scale(8),
        marginBlockEnd: scale(8),
        marginBlockStart: scale(16),
      } }
    >
      { Array(3).fill(0).map((_, i) => (
        <Thumbnail
          // eslint-disable-next-line react/no-array-index-key
          key={ `${i}-thumb` }
          style={ { flex: 1 } }
        />
      )) }
    </View>
    <FilmGridThumbnail />
  </View>
);
