import { Thumbnail } from 'Component/Thumbnail';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './FilmScreen.style.atv';

export const FilmScreenThumbnail = ({
  styles,
}: {
  styles: ThemedStyles<typeof componentStyles>;
}) => {
  const { scale } = useAppTheme();

  return (
    <View>
      <View style={ { flexDirection: 'row' } }>
        <View style={ styles.actions }>
          { Array(5).fill(0).map((_, index) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `film-action-thumb-${index}` }
              height={ scale(32) }
              width={ scale(110) }
            />
          )) }
        </View>
      </View>
      <View style={ styles.mainContent }>
        <Thumbnail
          height="100%"
          style={ styles.poster }
        />
        <Thumbnail
          height="72%"
          width="100%"
          style={ styles.mainInfo }
        />
      </View>
    </View>
  );
};
