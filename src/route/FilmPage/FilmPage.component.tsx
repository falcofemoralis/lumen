import { Rating } from '@kolking/react-native-rating';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

  if (!film) {
    return (
      <Page>
        <View style={ styles.topActions }>
          <TouchableOpacity
            style={ styles.topActionsButton }
            onPress={ () => router.back() }
          >
            <ThemedIcon
              icon={ {
                name: 'arrow-back',
                pack: IconPackType.MaterialIcons,
              } }
              size={ scale(32) }
              color="white"
            />
          </TouchableOpacity>
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
            style={ styles.poster }
          />
          <View style={ [styles.mainInfo, { width: '55%' }] }>
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
          style={ styles.description }
          height="20%"
          width="100%"
        />
        <View style={ styles.actions }>
          { Array(3).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-action` }
              height={ scale(48) }
              width="30%"
            />
          )) }
        </View>
        <Thumbnail
          style={ styles.playBtn }
          height={ scale(48) }
          width="100%"
        />
      </Page>
    );
  }

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      <TouchableOpacity
        style={ styles.topActionsButton }
        onPress={ () => router.back() }
      >
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

  const renderTitle = () => {
    const { title, originalTitle } = film;

    return (
      <View>
        <ThemedText style={ styles.title }>
          { title }
        </ThemedText>
        { originalTitle && (
          <ThemedText style={ styles.originalTitle }>
            { originalTitle }
          </ThemedText>
        ) }
      </View>
    );
  };

  const renderGenres = () => {
    const { genres = [] } = film;

    return (
      <ScrollView horizontal>
        <View style={ styles.genres }>
          { genres.map((genre) => (
            <ThemedText
              key={ genre }
              style={ styles.genre }
            >
              { genre }
            </ThemedText>
          )) }
        </View>
      </ScrollView>
    );
  };

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
      <View
        key={ text }
        style={ styles.textContainer }
      >
        { title && (
          <ThemedText style={ styles.textTitle }>
            { `${title}: ` }
          </ThemedText>
        ) }
        <ThemedText style={ styles.text }>
          { text }
        </ThemedText>
      </View>
    );
  };

  const renderCollectionInfo = (collection: string[], title?: string) => {
    if (!collection.length) {
      return null;
    }

    return (
      <View style={ styles.collectionContainer }>
        { title && (
          <ThemedText style={ styles.collectionTitle }>
            { `${title}: ` }
          </ThemedText>
        ) }
        { collection.map((item) => (
          <TouchableOpacity
            key={ item }
            style={ styles.collectionButton }
          >
            <ThemedText
              style={ styles.collectionButtonText }
            >
              { item }
            </ThemedText>
          </TouchableOpacity>
        )) }
      </View>
    );
  };

  const renderMainInfo = () => {
    const {
      releaseDate,
      ratings = [],
      directors = [],
      countries = [],
      duration,
    } = film;

    return (
      <View style={ styles.mainInfo }>
        { ratings.map(({ name, rating, votes }) => renderInfoText(`${rating} (${votes})`, name)) }
        { renderInfoText(releaseDate, 'Дата выхода') }
        { renderInfoText(duration, 'Время') }
        { renderRating() }
        { renderCollectionInfo(directors, 'Режиссер') }
        { renderCollectionInfo(countries, 'Страна') }
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

  const renderDescription = () => {
    const { description } = film;

    return <ThemedText style={ styles.description }>{ description }</ThemedText>;
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
        style={ styles.actionText }
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

  const renderRating = () => {
    const { ratings = [], ratingsScale } = film;

    if (!ratings.length) {
      return null;
    }

    return (
      <View style={ styles.rating }>
        <Rating
          size={ scale(12) }
          rating={ ratings[0].rating || 0 }
          scale={ 1 }
          spacing={ scale(2) }
          maxRating={ ratingsScale || 10 }
          fillColor={ Colors.secondary }
        />
      </View>
    );
  };

  const renderCollections = () => {
    const { infoLists = [] } = film;

    return (
      <View style={ styles.collections }>
        { renderCollectionInfo(infoLists.map(({ name, position }) => `${name} ${position}`)) }
      </View>
    );
  };

  const renderPlayerVideoSelector = () => {
    const { voices = [], hasVoices, hasSeasons } = film;

    if (!voices.length || (!hasVoices && !hasSeasons)) {
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

  return (
    <Page>
      <ScrollView>
        { renderTopActions() }
        { renderTitle() }
        { renderGenres() }
        { renderMainContent() }
        { renderQuickInfo() }
        { renderDescription() }
        { renderActions() }
        { renderPlayFilmButton() }
        { /* { renderCollections() } */ }
        { renderModals() }
      </ScrollView>
    </Page>
  );
}

export default FilmPageComponent;
