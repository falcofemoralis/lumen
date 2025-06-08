import Loader from 'Component/Loader';
import Thumbnail from 'Component/Thumbnail';
import { Dimensions, View } from 'react-native';
import { calculateLayoutWidth } from 'Style/Layout';
import { scale } from 'Util/CreateStyles';

import { THUMBNAILS_AMOUNT_TV } from './RecentPage.config';
import { styles } from './RecentPage.style.atv';

export const RecentPageThumbnail = () => {
  const containerWidth = calculateLayoutWidth();
  const { height: containerHeight } = Dimensions.get('window');

  const width = containerWidth / 2;
  const height = containerHeight / THUMBNAILS_AMOUNT_TV;

  return (
    <View style={ styles.grid }>
      { Array(THUMBNAILS_AMOUNT_TV).fill(0).map((_, index) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={ `recent-page-thumb-row-${index}` }
          style={ [
            styles.item,
            { width, height },
          ] }
        >
          <View>
            <Thumbnail
              style={ styles.poster }
            />
          </View>
          <View style={ styles.itemContent }>
            <Thumbnail
              height={ scale(30) }
              width="60%"
            />
            <Thumbnail
              height={ scale(20) }
              width="10%"
            />
            <Thumbnail
              height={ scale(20) }
              width="30%"
            />
          </View>
        </View>
      )) }
    </View>
  );
};
