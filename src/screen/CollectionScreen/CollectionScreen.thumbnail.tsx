import { Thumbnail } from 'Component/Thumbnail';
import { View } from 'react-native';
import { ThemedStyles } from 'Theme/types';

import { NUMBER_OF_COLUMNS, THUMBNAILS_AMOUNT } from './CollectionScreen.config';
import { componentStyles } from './CollectionScreen.style';

export const CollectionScreenThumbnail = ({
  styles,
  width,
}: {
  styles: ThemedStyles<typeof componentStyles>;
  width: number;
}) => {
  return (
    Array(THUMBNAILS_AMOUNT).fill(0).map((_, idx) => (
      <View
        // eslint-disable-next-line react/no-array-index-key
        key={ `collection-page-thumb-row-${idx}` }
        style={ { flexDirection: 'row', width: '100%' } }
      >
        { Array(NUMBER_OF_COLUMNS).fill(0).map((__, jdx) => (
          <View
            // eslint-disable-next-line react/no-array-index-key
            key={ `collection-page-thumb-col-${jdx}` }
            style={ [styles.item, { flexGrow: 1 }, jdx % 2 === 0 && styles.rowItem] }
          >
            <Thumbnail
              style={ styles.image }
              width={ width }
              height={ width * (120 / 208) }
            />
          </View>
        )) }
      </View>
    ))
  );
};
