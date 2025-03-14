import Loader from 'Component/Loader';
import Page from 'Component/Page';
import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmPage.style.atv';

export const FilmPageThumbnail = () => (
  <Page>
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
        height="100%"
        width="100%"
        style={ styles.mainInfo }
      />
    </View>
    <Loader
      isLoading
      fullScreen
    />
  </Page>
);
