import { Thumbnail } from 'Component/Thumbnail';
import { Wrapper } from 'Component/Wrapper';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { THUMBNAILS_AMOUNT } from './RecentScreen.config';

export const RecentScreenThumbnail = ({
  top,
  styles,
}: {
  top: number,
  styles: ThemedStyles
}) => {
  const { scale } = useAppTheme();

  return (
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
};
