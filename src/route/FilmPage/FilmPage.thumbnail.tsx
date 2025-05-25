import Page from 'Component/Page';
import ThemedPressable from 'Component/ThemedPressable';
import Thumbnail from 'Component/Thumbnail';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmPage.style';

export const FilmPageThumbnail = () => (
  <Page>
    <View style={ styles.topActions }>
      <ThemedPressable
        style={ styles.topActionsButton }
        onPress={ () => router.back() }
        mode='dark'
      >
        <ArrowLeft
          size={ scale(24) }
          color={ Colors.white }
        />
      </ThemedPressable>
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
