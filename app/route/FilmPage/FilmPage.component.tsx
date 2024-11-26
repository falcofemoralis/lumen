import FilmVideoSelector from 'Component/FilmVideoSelector';
import Player from 'Component/Player';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import { ActivityIndicator, View } from 'react-native';
import { Button } from 'react-native-paper';
import { DEMO_VIDEO } from 'Route/PlayerPage/PlayerPage.config';
import Colors from 'Style/Colors';
import { styles } from './FilmPage.style.';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film, isSelectorVisible, filmVideo, playFilm, hideVideoSelector, handleVideoSelect } =
    props;

  const renderVideoSelector = () => {
    if (!film) {
      return null;
    }

    const { voices } = film;

    if (!voices) {
      return null;
    }

    return (
      <FilmVideoSelector
        film={film}
        voices={voices}
        visible={isSelectorVisible}
        onHide={hideVideoSelector}
        onSelect={handleVideoSelect}
      />
    );
  };

  if (!film) {
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
    // TODO
    return (
      <View style={styles.player}>
        <Player uri={DEMO_VIDEO} />
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
      {renderVideoSelector()}
    </ThemedView>
  );
}

export default FilmPageComponent;
