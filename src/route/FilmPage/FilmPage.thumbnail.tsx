import Page from 'Component/Page';
import ThemedPressable from 'Component/ThemedPressable';
import Thumbnail from 'Component/Thumbnail';
import Wrapper from 'Component/Wrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { View } from 'react-native';
import { Colors } from 'Style/Colors';
import { scale } from 'Util/CreateStyles';
import { noopFn } from 'Util/Function';

import { styles } from './FilmPage.style';

export const FilmPageThumbnail = () => (
  <View>
    <View style={ styles.upperContent }>
      <Wrapper>
        <View style={ styles.topActions }>
          <ThemedPressable
            style={ styles.topActionsButton }
            onPress={ () => router.back() }
          >
            <ArrowLeft
              size={ scale(24) }
              color={ Colors.white }
            />
          </ThemedPressable>
          <ThemedPressable
            style={ styles.topActionsButton }
            onPress={ noopFn }
          >
            <Share2
              size={ scale(24) }
              color={ Colors.white }
            />
          </ThemedPressable>
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
              key={ `${i}-thumb-genre` }
              height={ scale(24) }
              width={ scale(64) }
            />
          )) }
        </View>
        <View style={ styles.upperContentWrapper }>
          <Thumbnail
            style={ styles.posterWrapper }
          />
          <View style={ styles.upperContentInfo }>
            { Array(5).fill(0).map((_, i) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-thumb-info` }
                style={ styles.textContainer }
                height={ scale(16) }
                width={ scale(32) * (i+1) }
              />
            )) }
          </View>
        </View>
      </Wrapper>
    </View>
    <View style={ styles.middleContent }>
      <LinearGradient
        style={ styles.backgroundGradient }
        colors={ [Colors.background, Colors.transparent] }
        start={ { x: 0, y: 1 } }
        end={ { x: 0, y: 0 } }
      />
      <Wrapper>
        <View style={ styles.middleActions }>
          { Array(5).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-thumb-action` }
              style={ styles.middleActionButton }
              height={ scale(44) }
              width="100%"
            />
          )) }
        </View>
      </Wrapper>
    </View>
    <View style={ styles.bottomContent }>
      <View style={ styles.mainContent }>
        <Wrapper>
          <Thumbnail
            style={ styles.description }
            height="60%"
            width="100%"
          />
        </Wrapper>
      </View>
    </View>
  </View>
);
