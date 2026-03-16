import { FilmGrid } from 'Component/FilmGrid';
import { Thumbnail } from 'Component/Thumbnail';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

export const BookmarksScreenThumbnail = () => {
  const { scale } = useAppTheme();

  return (
    <View>
      <View
        style={ {
          flexDirection: 'row',
          height: scale(40),
          gap: scale(8),
          marginBlockEnd: scale(16),
        } }
      >
        { Array(3).fill(0).map((_, i) => (
          <Thumbnail
            // eslint-disable-next-line react/no-array-index-key
            key={ `${i}-thumb` }
            width="20%"
            height={ scale(40) }
          />
        )) }
      </View>
      <FilmGrid films={ [] } />
    </View>
  );
};
