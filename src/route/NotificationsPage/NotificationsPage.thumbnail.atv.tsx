import { FilmListThumbnail } from 'Component/FilmList/FilmList.thumbnail.atv';
import Loader from 'Component/Loader';
import Page from 'Component/Page';
import Thumbnail from 'Component/Thumbnail';
import { View } from 'react-native';
import { scale } from 'Util/CreateStyles';

export const NotificationsPageThumbnail = () => (
  <Page>
    <View style={ { gap: scale(24) } }>
      <Thumbnail
        height={ scale(42) }
        width={ scale(200) }
      />
      <FilmListThumbnail />
      <Loader
        isLoading
        fullScreen
      />
    </View>
  </Page>
);
