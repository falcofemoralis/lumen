import { FilmSectionsThumbnail } from 'Component/FilmSections/FilmSections.thumbnail.atv';
import Loader from 'Component/Loader';
import Page from 'Component/Page';
import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './ActorPage.style.atv';

export const ActorPageThumbnail = () => (
  <Page>
    <View>
      <View style={ styles.mainContent }>
        <Thumbnail
          style={ styles.photo }
        />
        <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
          { Array(5).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `$actor-thumb-${i}` }
              height={ scale(32) }
              width={ scale(200) }
            />
          )) }
        </View>
      </View>
      <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
        <Thumbnail
          height={ scale(42) }
          width={ scale(200) }
        />
        <FilmSectionsThumbnail />
      </View>
    </View>
    <Loader
      isLoading
      fullScreen
    />
  </Page>
);
