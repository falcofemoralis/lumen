import { FilmGridThumbnail } from 'Component/FilmGrid/FilmGrid.thumbnail';
import Page from 'Component/Page';
import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

export const NotificationsPageThumbnail = () => (
  <Page>
    <View style={ { gap: scale(8) } }>
      <Thumbnail
        height={ scale(24) }
        width={ scale(200) }
      />
      <FilmGridThumbnail />
    </View>
  </Page>
);
