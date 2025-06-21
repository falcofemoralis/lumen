import { FilmSectionsThumbnail } from 'Component/FilmSections/FilmSections.thumbnail.atv';
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
      <FilmSectionsThumbnail />
    </View>
  </Page>
);
