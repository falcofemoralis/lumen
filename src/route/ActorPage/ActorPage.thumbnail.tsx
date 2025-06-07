import { FilmSectionsThumbnail } from 'Component/FilmSections/FilmSections.thumbnail';
import Page from 'Component/Page';
import Thumbnail from 'Component/Thumbnail';
import Wrapper from 'Component/Wrapper';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './ActorPage.style';

export const ActorPageThumbnail = () => (
  <Page>
    <Wrapper>
      <View style={ styles.mainContent }>
        <Thumbnail
          style={ styles.photoWrapper }
        />
        <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
          { Array(5).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-thumb-actor-info` }
              height={ scale(16) }
              width={ scale(32) * (i+1) }
            />
          )) }
        </View>
      </View>
      <View style={ [styles.additionalInfo, { marginTop: 0 }] }>
        <Thumbnail
          height={ scale(24) }
          width={ scale(200) }
        />
        <FilmSectionsThumbnail />
        <FilmSectionsThumbnail />
      </View>
    </Wrapper>
  </Page>
);
