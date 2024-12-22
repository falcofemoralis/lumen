import Page from 'Component/Page';
import FilmVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import __ from 'i18n/__';
import { ActivityIndicator, View } from 'react-native';
import Colors from 'Style/Colors';
import { styles } from './FilmPage.style.';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent(props: FilmPageComponentProps) {
  const { film, isSelectorVisible, filmVideo, playFilm, hideVideoSelector, handleVideoSelect } =
    props;

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

  const renderVideoSelector = () => {
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

  const renderPlayFilmButton = () => {
    return (
      <ThemedButton
        style={styles.playBtn}
        onPress={playFilm}
      >
        {__('Play')}
      </ThemedButton>
    );
  };

  const renderPoster = () => {
    const { poster } = film;

    return (
      <ThemedImage
        src={poster}
        style={styles.poster}
      />
    );
  };

  const renderMainInfo = () => {
    const { title, originalTitle, releaseDate, genres = [], countries = [], duration } = film;

    return (
      <View style={styles.mainInfo}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {originalTitle && <ThemedText style={styles.originalTitle}>{originalTitle}</ThemedText>}
        {releaseDate && <ThemedText style={styles.originalTitle}>{releaseDate}</ThemedText>}
        {genres.length > 0 && <ThemedText style={styles.originalTitle}>{genres[0]}</ThemedText>}
        {countries.length > 0 && (
          <ThemedText style={styles.originalTitle}>{countries[0]}</ThemedText>
        )}
        {duration && <ThemedText style={styles.originalTitle}>{duration}</ThemedText>}
      </View>
    );
  };

  const renderMainContent = () => {
    return (
      <View style={styles.mainContent}>
        {renderPoster()}
        {renderMainInfo()}
      </View>
    );
  };

  const renderDescription = () => {
    const { description } = film;

    return <ThemedText style={styles.description}>{description}</ThemedText>;
  };

  return (
    <Page style={styles.container}>
      {renderMainContent()}
      {renderPlayFilmButton()}
      {renderDescription()}
      {/* <ThemedView>
        <ThemedText>{film.title}</ThemedText>
        <ThemedText>{film.id}</ThemedText>
        <Button onPress={playFilm}>
          {film.hasVoices || film.hasSeasons ? 'Select' : __('Play')}
        </Button>
      </ThemedView>
      {renderVideoSelector()} */}
    </Page>
  );
}

export default FilmPageComponent;
