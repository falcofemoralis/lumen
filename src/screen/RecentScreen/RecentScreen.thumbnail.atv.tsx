import { Thumbnail } from 'Component/Thumbnail';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './RecentScreen.style.atv';

export const RecentScreenThumbnail = ({
  styles,
  thumbnailsAmount,
}: {
  styles: ThemedStyles<typeof componentStyles>;
  thumbnailsAmount: number;
}) => {
  const { scale } = useAppTheme();

  return (
    <View style={ [styles.grid, styles.thumbnailGrid] }>
      { Array(thumbnailsAmount).fill(0).map((_, index) => (
        <View
          // eslint-disable-next-line react/no-array-index-key
          key={ `recent-page-thumb-row-${index}` }
          style={ styles.cell }
        >
          <View style={ styles.row }>
            <View style={ [styles.fill, styles.item] }>
              <View style={ [styles.poster, styles.posterContainer] }>
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
          </View>
        </View>
      )) }
    </View>
  );
};
