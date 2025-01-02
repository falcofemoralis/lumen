import Page from 'Component/Page';
import FilmVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import __ from 'i18n/__';
import { ActivityIndicator, View } from 'react-native';
import Colors from 'Style/Colors';

import { formatInfoLabel, INFO_LABELS } from './FilmPage.config';
import { styles } from './FilmPage.style.';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent({
  film,
  playFilm,
  hideVideoSelector,
  handleVideoSelect,
}: FilmPageComponentProps) {
  if (!film) {
    return (
      <ThemedView>
        <ActivityIndicator
          animating
          color={ Colors.primary }
        />
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const renderPoster = () => {
    const { poster } = film;

    return (
      <ThemedImage
        src={ poster }
        style={ styles.poster }
      />
    );
  };

  const renderMainInfo = () => {
    const {
      title,
      originalTitle,
      releaseDate,
      genres = [],
      countries = [],
      duration,
    } = film;

    return (
      <View style={ styles.mainInfo }>
        <ThemedText style={ styles.title }>{ title }</ThemedText>
        { originalTitle && (
          <ThemedText style={ styles.originalTitle }>
            { originalTitle }
          </ThemedText>
        ) }
        { releaseDate && (
          <ThemedText style={ styles.releaseDate }>
            { formatInfoLabel(INFO_LABELS.releaseDate, releaseDate) }
          </ThemedText>
        ) }
        <View style={ styles.mainInfoRow }>
          { genres.length > 0 && (
            <ThemedText style={ styles.mainInfoItem }>
              { formatInfoLabel(INFO_LABELS.genre, genres[0]) }
            </ThemedText>
          ) }
          { countries.length > 0 && (
            <ThemedText style={ styles.mainInfoItem }>
              { formatInfoLabel(INFO_LABELS.country, countries[0]) }
            </ThemedText>
          ) }
          { duration && (
            <ThemedText style={ styles.mainInfoItem }>
              { formatInfoLabel(INFO_LABELS.duration, duration) }
            </ThemedText>
          ) }
        </View>
      </View>
    );
  };

  const renderMainContent = () => (
    <View style={ styles.mainContent }>
      { renderPoster() }
      { renderMainInfo() }
    </View>
  );

  const renderPlayerVideoSelector = () => {
    const { voices = [], hasVoices, hasSeasons } = film;

    if (!voices.length || (!hasVoices && !hasSeasons)) {
      return null;
    }

    return (
      <FilmVideoSelector
        film={ film }
        onHide={ hideVideoSelector }
        onSelect={ handleVideoSelect }
      />
    );
  };

  const renderPlayFilmButton = () => (
    <ThemedButton
      style={ styles.playBtn }
      onPress={ playFilm }
    >
      { __('Watch Now') }
    </ThemedButton>
  );

  const renderDescription = () => {
    const { description } = film;

    return <ThemedText style={ styles.description }>{ description }</ThemedText>;
  };

  const renderModals = () => renderPlayerVideoSelector();

  return (
    <Page>
      { renderMainContent() }
      { renderPlayFilmButton() }
      { renderDescription() }
      { renderModals() }
    </Page>
  );
}

export default FilmPageComponent;
