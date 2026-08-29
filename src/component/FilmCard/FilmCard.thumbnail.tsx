import { Thumbnail } from 'Component/Thumbnail';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';

import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from './FilmCard.config';

export const FilmCardThumbnail = () => {
  const { scale } = useAppTheme();

  return (
    <View style={ { gap: scale(8) } }>
      <View style={ { aspectRatio: `${POSTER_ASPECT_WIDTH} / ${POSTER_ASPECT_HEIGHT}` } }>
        <Thumbnail
          height='100%'
          width='100%'
        />
      </View>
      <Thumbnail
        height={ scale(24) }
        width='100%'
      />
      <Thumbnail
        height={ scale(16) }
        width={ scale(40) }
      />
    </View>
  );
};
