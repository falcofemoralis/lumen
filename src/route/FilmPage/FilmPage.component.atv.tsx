import { Rating } from '@kolking/react-native-rating';
import Loader from 'Component/Loader';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedCard from 'Component/ThemedCard';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import Thumbnail from 'Component/Thumbnail';
import __ from 'i18n/__';
import { View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmPage.style.atv';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent({
  film,
  playFilm,
  hideVideoSelector,
  handleVideoSelect,
}: FilmPageComponentProps) {
  if (!film) {
    return (
      <Page>
        <SpatialNavigationView direction="horizontal">
          <ThemedView style={ styles.actions }>
            { Array(5).fill(0).map((_, i) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-thumb` }
                height={ 32 }
                width={ 110 }
              />
            )) }
          </ThemedView>
        </SpatialNavigationView>
        <View style={ styles.mainContent }>
          <Thumbnail style={ styles.poster } />
          <Thumbnail style={ styles.mainInfo } />
        </View>
        <Loader
          isLoading
          fullScreen
        />
      </Page>
    );
  }

  const renderAction = (text: string, icon: string, onPress?: () => void) => (
    <SpatialNavigationFocusableView>
      <ThemedButton
        variant="outlined"
        onPress={ onPress }
        icon={ {
          name: icon,
          pack: IconPackType.MaterialCommunityIcons,
        } }
        style={ styles.actionButton }
        textStyle={ styles.actionButtonText }
        iconStyle={ styles.actionButtonIcon }
      >
        { text }
      </ThemedButton>
    </SpatialNavigationFocusableView>
  );

  const renderActions = () => (
    <SpatialNavigationView direction="horizontal">
      <DefaultFocus>
        <ThemedView style={ styles.actions }>
          { renderAction(__('Watch Now'), 'play-outline', playFilm) }
          { renderAction('Comments', 'comment-text-multiple-outline') }
          { renderAction('Bookmark', 'movie-star-outline') }
          { renderAction('Trailer', 'movie-open-check-outline') }
          { renderAction('Share', 'share-variant-outline') }
          { renderAction('Download', 'folder-download-outline') }
        </ThemedView>
      </DefaultFocus>
    </SpatialNavigationView>
  );

  const renderPoster = () => {
    const { poster } = film;

    return (
      <ThemedImage
        src={ poster }
        style={ styles.poster }
      />
    );
  };

  const renderInfoText = (text: string | undefined, title?: string) => {
    if (!text) {
      return null;
    }

    return (
      <ThemedText style={ styles.text }>
        { title ? `${title}: ${text}` : text }
      </ThemedText>
    );
  };

  const renderCollection = (collection: string[], title: string) => (
    <View style={ styles.collectionContainer }>
      <ThemedText style={ styles.collectionTitle }>
        { title }
      </ThemedText>
      <SpatialNavigationView
        style={ styles.collection }
        direction="horizontal"
      >
        { collection.map((item) => (
          <ThemedButton
            key={ item }
            style={ styles.collectionButton }
            textStyle={ styles.collectionButtonText }
          >
            { item }
          </ThemedButton>
        )) }
      </SpatialNavigationView>
    </View>
  );

  const renderMainInfo = () => {
    const {
      title,
      originalTitle,
      releaseDate,
      genres = [],
      countries = [],
      ratings = [],
      ratingsScale,
      directors = [],
      duration,
      description,
    } = film;

    return (
      <ThemedCard style={ styles.mainInfo }>
        <ThemedText style={ styles.title }>{ title }</ThemedText>
        { originalTitle && (
          <ThemedText style={ styles.originalTitle }>
            { originalTitle }
          </ThemedText>
        ) }
        <Rating
          style={ styles.rating }
          size={ scale(12) }
          rating={ ratings[0]?.rating || 0 }
          scale={ 1 }
          spacing={ scale(2) }
          maxRating={ ratingsScale || 10 }
          fillColor={ Colors.secondary }
        />
        <View style={ styles.textContainer }>
          { renderInfoText(`${releaseDate} • ${duration}`) }
          { renderInfoText(ratings.reduce((acc, { text }) => `${acc}${acc !== '' ? ' • ' : ''}${text}`, ''), 'Рейтинги') }
          { renderInfoText(directors.length > 0 ? directors[0] : undefined, 'Режиссер') }
        </View>
        { renderCollection(genres, 'Жанры') }
        { renderCollection(countries, 'Страны') }
        <ThemedText style={ styles.description }>
          { description }
        </ThemedText>
      </ThemedCard>
    );
  };

  const renderMainContent = () => (
    <View style={ styles.mainContent }>
      { renderPoster() }
      { renderMainInfo() }
    </View>
  );

  const renderPlayerVideoSelector = () => {
    const { voices = [] } = film;

    if (!voices.length) {
      return null;
    }

    return (
      <PlayerVideoSelector
        film={ film }
        onHide={ hideVideoSelector }
        onSelect={ handleVideoSelect }
      />
    );
  };

  const renderModals = () => renderPlayerVideoSelector();

  const renderContent = () => (
    <View>
      { renderActions() }
      { renderMainContent() }
      { renderModals() }
    </View>
  );

  return (
    <Page testID="film-page">
      { renderContent() }
    </Page>
  );
}

export default FilmPageComponent;
