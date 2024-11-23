import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { FilmPageComponentProps } from './FilmPage.type';
import ThemedImage from 'Component/ThemedImage';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Button } from 'react-native-paper';
import Colors from 'Style/Colors';
import { styles } from './FilmPage.style.';
import Player from 'Component/Player';
import { DEMO_VIDEO } from 'Route/PlayerPage/PlayerPage.config';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film, filmVideo, playFilm } = props;

  if (!film) {
    console.log('No film');

    return (
      <ThemedView>
        <ActivityIndicator
          animating={true}
          color={Colors.primary}
        />
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (filmVideo) {
    const streams = filmVideo.streams;

    return (
      <View style={styles.player}>
        <Player uri={DEMO_VIDEO ?? streams[0].url} />
      </View>
    );
  }

  return (
    <ThemedView>
      <ThemedText>Page</ThemedText>
      <ThemedView>
        <ThemedImage
          src={film.poster}
          style={{ height: 100, width: '100%' }}
        />
      </ThemedView>
      <ThemedView>
        <ThemedText>{film.title}</ThemedText>
        <ThemedText>{film.id}</ThemedText>
        <Button onPress={playFilm}>Open film</Button>
      </ThemedView>
    </ThemedView>
  );
}

export default FilmPageComponent;
