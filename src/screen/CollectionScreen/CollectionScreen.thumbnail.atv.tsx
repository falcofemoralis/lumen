import { Thumbnail } from 'Component/Thumbnail';
import { View } from 'react-native';
import { ThemedStyles } from 'Theme/types';

import { NUMBER_OF_COLUMNS_TV, THUMBNAILS_AMOUNT_TV } from './CollectionScreen.config';
import { componentStyles, ROW_GAP } from './CollectionScreen.style.atv';

export const CollectionScreenThumbnail = ({
  width,
  height,
  styles,
}: {
  width: number;
  height: number;
  styles: ThemedStyles<typeof componentStyles>;
}) => {
  return (
    <View style={ [styles.grid, { flexDirection: 'column', gap: ROW_GAP }] }>
      { Array(THUMBNAILS_AMOUNT_TV).fill(0).map((_, idx) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={ `collection-page-thumb-row-${idx}` }
          style={ { flexDirection: 'row', gap: ROW_GAP, width: '100%' } }
        >
          { Array(NUMBER_OF_COLUMNS_TV).fill(0).map((__, jdx) => (
            <View
              // eslint-disable-next-line react/no-array-index-key
              key={ `collection-page-thumb-col-${jdx}` }
              style={ styles.item }
            >
              <Thumbnail
                width={ width }
                height={ height }
              />
            </View>
          )) }
        </View>
      )) }
    </View>
  );
};
