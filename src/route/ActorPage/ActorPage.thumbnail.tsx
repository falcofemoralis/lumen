import { FilmListThumbnail } from 'Component/FilmList/FilmList.thumbnail';
import Page from 'Component/Page';
import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './ActorPage.style';

export const ActorPageThumbnail = () => (
  <Page>
    <View>
      <View style={ styles.mainContent }>
        <Thumbnail
          style={ styles.photoWrapper }
        />
        <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
          { Array(5).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-actor-thumb` }
              height={ scale(16) }
              width={ scale(200) }
            />
          )) }
        </View>
      </View>
      <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
        <Thumbnail
          height={ scale(24) }
          width={ scale(200) }
        />
        <FilmListThumbnail />
        <FilmListThumbnail />
      </View>
    </View>
  </Page>
);
