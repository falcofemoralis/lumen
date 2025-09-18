import Thumbnail from 'Component/Thumbnail';
import Wrapper from 'Component/Wrapper';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { THUMBNAILS_AMOUNT } from './RecentPage.config';
import { styles } from './RecentPage.style';

export const RecentPageThumbnail = ({ top }: { top: number }) => (
  <Wrapper style={ { paddingTop: top } }>
    { Array(THUMBNAILS_AMOUNT).fill(0).map((_, index) => (
      <View
        // eslint-disable-next-line react/no-array-index-key
        key={ `recent-page-thumb-row-${index} ` }
        style={ [styles.item, index !== 0 && styles.itemBorder] }
      >
        <View style={ styles.itemContainer }>
          <View>
            <Thumbnail
              style={ styles.poster }
            />
          </View>
          <View style={ styles.itemContent }>
            <Thumbnail
              width="60%"
              height={ scale(20) }
            />
            <Thumbnail
              width="30%"
              height={ scale(20) }
            />
            <Thumbnail
              width="50%"
              height={ scale(20) }
            />
          </View>
          <Thumbnail
            width={ scale(30) }
            height={ scale(30) }
          />
        </View>
      </View>
    )) }
  </Wrapper>
);
