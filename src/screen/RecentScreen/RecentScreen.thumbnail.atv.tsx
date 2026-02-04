import { Thumbnail } from 'Component/Thumbnail';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { THUMBNAILS_AMOUNT_TV } from './RecentScreen.config';

export const RecentScreenThumbnail = ({
  width: containerWidth,
  styles,
}: {
  width: number;
  styles: ThemedStyles
}) => {
  const { scale, theme } = useAppTheme();

  const width = containerWidth / 2;
  const height = theme.dimensions.height / THUMBNAILS_AMOUNT_TV;

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
