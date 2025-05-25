import Page from 'Component/Page';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import Thumbnail from 'Component/Thumbnail';
import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmPage.style';

export const FilmPageThumbnail = () => (
  <Page>
    <View style={ styles.topActions }>
      <TouchableOpacity
        style={ styles.topActionsButton }
        onPress={ () => router.back() }
      >
        <ThemedIcon
          icon={ {
            name: 'arrow-back',
            pack: IconPackType.MaterialIcons,
          } }
          size={ scale(32) }
          color="white"
        />
      </TouchableOpacity>
      <Thumbnail
        style={ styles.topActionsButton }
        height={ scale(32) }
        width={ scale(32) }
      />
    </View>
    <Thumbnail
      height={ scale(24) }
      width="100%"
    />
    <Thumbnail
      style={ { marginTop: scale(8) } }
      height={ scale(24) }
      width="50%"
    />
    <View style={ styles.genres }>
      { Array(5).fill(0).map((_, i) => (
        <Thumbnail
          // eslint-disable-next-line react/no-array-index-key
          key={ `${i}-thumb` }
          height={ scale(24) }
          width={ scale(64) }
        />
      )) }
    </View>
    <View style={ styles.mainContent }>
      <Thumbnail
        style={ styles.posterWrapper }
      />
      <View style={ [styles.mainInfo, { width: '55%' }] }>
        { Array(5).fill(0).map((_, i) => (
          <Thumbnail
            // eslint-disable-next-line react/no-array-index-key
            key={ `${i}-thumb` }
            style={ styles.textContainer }
            height={ scale(16) }
            width={ scale(32) * (i+1) }
          />
        )) }
      </View>
    </View>
    <Thumbnail
      style={ styles.description }
      height="40%"
      width="100%"
    />
    <Thumbnail
      style={ styles.playBtn }
      height={ scale(42) }
      width="100%"
    />
  </Page>
);
