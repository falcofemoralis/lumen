import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { THUMBNAIL_AMOUNT } from './Comments.config';
import { styles } from './Comments.style';

export const CommentsThumbnail = () => (
  <View style={ [styles.commentsList, { gap: scale(8) }] }>
    { Array(THUMBNAIL_AMOUNT).fill(0).map((_, i) => (
      <View
        // eslint-disable-next-line react/no-array-index-key
        key={ `${i}-thumb-comment` }
        style={ styles.item }
      >
        <Thumbnail
          // style={ styles.comment }
          height={ scale(32) }
          width={ scale(32) }
        />
        <Thumbnail
        // eslint-disable-next-line react/no-array-index-key
          key={ `${i}-thumb-comment` }
          style={ styles.comment }
          height={ scale(100) }
        />
      </View>
    )) }
  </View>
);