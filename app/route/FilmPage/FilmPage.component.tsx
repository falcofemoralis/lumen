import FilmVideoSelector from 'Component/FilmVideoSelector';
import Page from 'Component/Page';
import Player from 'Component/Player';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import __ from 'i18n/__';
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

    const { voices = [], hasVoices, hasSeasons } = film;

    if (!voices.length || (!hasVoices && !hasSeasons)) {
      return null;
    }

    return (
      <FilmVideoSelector
        film={film}
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
    <Page>
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
        <Button onPress={playFilm}>
          {film.hasVoices || film.hasSeasons ? 'Select' : __('Play')}
        </Button>
      </ThemedView>
      {renderVideoSelector()}
    </Page>
  );
}

export default FilmPageComponent;
