import { Header } from 'Component/Header';
import { Thumbnail } from 'Component/Thumbnail';
import { Wrapper } from 'Component/Wrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { Forward } from 'lucide-react-native';
import { View } from 'react-native';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

export const FilmScreenThumbnail = ({
  top,
  styles,
}: {
  top: number,
  styles: ThemedStyles
}) => {
  const { scale, theme } = useAppTheme();

  return (
    <View>
      <View style={ styles.upperContent }>
        <Header
          AdditionalActionIcon={ Forward }
          style={ { paddingTop: top } }
        />
        <Wrapper>
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
          colors={ [theme.colors.background, theme.colors.transparent] }
          start={ { x: 0, y: 1 } }
          end={ { x: 0, y: 0 } }
        />
        <Wrapper>
          <View style={ styles.middleActions }>
            { Array(5).fill(0).map((_, i) => (
              <View
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-thumb-action` }
                style={ styles.middleAction }
              >
                <Thumbnail
                  // eslint-disable-next-line react/no-array-index-key
                  key={ `${i}-thumb-action` }
                  style={ styles.middleActionButton }
                />
              </View>
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
};
