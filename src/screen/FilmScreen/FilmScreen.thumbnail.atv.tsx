import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH, POSTER_WIDTH_RATIO } from 'Component/FilmCard/FilmCard.config';
import { Thumbnail } from 'Component/Thumbnail';
import { Wrapper } from 'Component/Wrapper';
import { useLayout } from 'Hooks/useLayout';
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
  const { width } = useLayout();

  // Poster keeps the same 30% width / 166:250 ratio as the real one,
  // resolved to px because the placeholder always needs a definite height
  const posterWidth = width * POSTER_WIDTH_RATIO;
  const posterHeight = posterWidth * (POSTER_ASPECT_HEIGHT / POSTER_ASPECT_WIDTH);

  return (
    <Wrapper style={ styles.page }>
      <View style={ { flexDirection: 'row' } }>
        <View style={ [styles.actions, { justifyContent: 'center' }] }>
          { Array(5).fill(0).map((_, index) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `film-action-thumb-${index}` }
              height={ scale(38) }
              width={ scale(110) }
            />
          )) }
        </View>
      </View>
      <View style={ styles.mainContent }>
        <Thumbnail
          style={ {
            width: posterWidth,
            height: posterHeight,
            borderRadius: scale(16),
          } }
        />
        <Thumbnail
          style={ {
            flex: 1,
            height: posterHeight,
            borderRadius: scale(16),
          } }
        />
      </View>
    </Wrapper>
  );
};
