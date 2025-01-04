import { Rating } from '@kolking/react-native-rating';
import Page from 'Component/Page';
import FilmVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import __ from 'i18n/__';
import {
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from 'Style/Colors';
import { scale } from 'Util/CreateStyles';

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
      <Page>
        <View style={ styles.topActions }>
          <Thumbnail
            style={ styles.topActionsButton }
            height={ scale(32) }
            width={ scale(32) }
          />
          <Thumbnail
            style={ styles.topActionsButton }
            height={ scale(32) }
            width={ scale(32) }
          />
        </View>
        <View style={ styles.mainContent }>
          <Thumbnail
            style={ styles.poster }
          />
          <View style={ styles.mainInfo }>
            <Thumbnail
              height={ scale(24) }
              width="100%"
            />
            <Thumbnail
              style={ styles.textContainer }
              height={ scale(20) }
              width="70%"
            />
            { Array(5).fill(0).map((_, i) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-thumb` }
                style={ styles.textContainer }
                height={ scale(16) }
                width="100%"
              />
            )) }
          </View>
        </View>
        <View style={ styles.quickInfo }>
          { Array(4).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-quick` }
              height={ scale(48) }
              width="20%"
            />
          )) }
        </View>
        <Thumbnail
          style={ styles.playBtn }
          height={ scale(48) }
          width="100%"
        />
        <View style={ styles.actions }>
          { Array(3).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-action` }
              height={ scale(32) }
              width="30%"
            />
          )) }
        </View>
        <Thumbnail
          style={ styles.description }
          height="30%"
          width="100%"
        />
      </Page>
    );
  }

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      <TouchableOpacity style={ styles.topActionsButton }>
        <ThemedIcon
          icon={ {
            name: 'arrow-back',
            pack: IconPackType.MaterialIcons,
          } }
          size={ scale(32) }
          color="white"
        />
      </TouchableOpacity>
      <TouchableOpacity style={ styles.topActionsButton }>
        <ThemedIcon
          icon={ {
            name: 'share',
            pack: IconPackType.MaterialIcons,
          } }
          size={ scale(32) }
          color="white"
        />
      </TouchableOpacity>
    </View>
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

  const renderMainInfo = () => {
    const {
      title,
      originalTitle,
      releaseDate,
      ratings = [],
      ratingsScale,
      directors = [],
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
      </View>
    );
  };

  const renderMainContent = () => (
    <View style={ styles.mainContent }>
      { renderPoster() }
      { renderMainInfo() }
    </View>
  );

  const renderQuickInfoText = (title: string, text: string) => (
    <View style={ styles.quickInfoTextWrapper }>
      <ThemedText style={ styles.quickInfoUpperText }>{ title }</ThemedText>
      <ThemedText style={ styles.quickInfoLowerText }>{ text }</ThemedText>
    </View>
  );

  const renderQuickInfo = () => {
    const {
      genres = [],
      countries = [],
      duration,
      ratings = [],
    } = film;

    return (
      <View style={ styles.quickInfo }>
        { genres.length > 0 && renderQuickInfoText('Жанр', genres[0]) }
        { countries.length > 0 && renderQuickInfoText('Страна', countries[0]) }
        { ratings.length > 0 && renderQuickInfoText('Рейтинг', `${ratings[0].rating} (${ratings[0].votes})`) }
        { duration && renderQuickInfoText('Длина', duration) }
      </View>
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

  const renderAction = (text: string, icon: string, onPress?: () => void) => (
    <TouchableOpacity
      style={ styles.action }
      onPress={ onPress }
    >
      <ThemedIcon
        style={ styles.actionIcon }
        icon={ {
          name: icon,
          pack: IconPackType.MaterialCommunityIcons,
        } }
        size={ scale(24) }
        color="white"
      />
      <ThemedText
        style={ styles.text }
      >
        { text }
      </ThemedText>
    </TouchableOpacity>
  );

  const renderActions = () => (
    <View style={ styles.actions }>
      { renderAction(__('Trailer'), 'movie-open-check-outline') }
      { renderAction(__('Bookmark'), 'movie-star-outline') }
      { renderAction(__('Download'), 'folder-download-outline') }
    </View>
  );

  const renderDescription = () => {
    const { description } = film;

    return <ThemedText style={ styles.description }>{ description }</ThemedText>;
  };

  const renderCollection = (collection: string[], title: string) => (
    <View style={ styles.collectionContainer }>
      <ThemedText style={ styles.collectionTitle }>
        { title }
      </ThemedText>
      <ScrollView horizontal>
        <View style={ styles.collection }>
          { collection.map((item) => (
            <TouchableOpacity
              key={ item }
              style={ styles.collectionButton }
            >
              <ThemedText style={ styles.collectionButtonText }>
                { item }
              </ThemedText>
            </TouchableOpacity>
          )) }
        </View>
      </ScrollView>
    </View>
  );

  const renderCollections = () => {
    const { genres = [], countries = [] } = film;

    return (
      <View style={ styles.collectionContainer }>
        { renderCollection(genres, __('Genres')) }
        { renderCollection(countries, __('Countries')) }
      </View>
    );
  };

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

  const renderModals = () => renderPlayerVideoSelector();

  return (
    <Page>
      <ScrollView>
        { renderTopActions() }
        { renderMainContent() }
        { renderQuickInfo() }
        { renderPlayFilmButton() }
        { renderActions() }
        { renderDescription() }
        { renderCollections() }
        { renderModals() }
      </ScrollView>
    </Page>
  );
}

export default FilmPageComponent;
