import { Rating } from '@kolking/react-native-rating';
import FilmCard from 'Component/FilmCard';
import Loader from 'Component/Loader';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedAccordion from 'Component/ThemedAccordion';
import ThemedButton from 'Component/ThemedButton';
import ThemedCard from 'Component/ThemedCard';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import Thumbnail from 'Component/Thumbnail';
import __ from 'i18n/__';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import Colors from 'Style/Colors';
import { ActorInterface } from 'Type/Actor.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FranchiseItem } from 'Type/FranchiseItem.interface';
import { InfoListInterface } from 'Type/InfoList.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';

import { PLAYER_VIDEO_SELECTOR_OVERLAY_ID } from './FilmPage.config';
import { styles } from './FilmPage.style.atv';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent({
  film,
  playFilm,
  hideVideoSelector,
  handleVideoSelect,
}: FilmPageComponentProps) {
  const { height } = Dimensions.get('window');

  if (!film) {
    return (
      <Page>
        <SpatialNavigationView direction="horizontal">
          <ThemedView style={ styles.actions }>
            { Array(5).fill(0).map((_, i) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-thumb` }
                height={ scale(32) }
                width={ scale(110) }
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

  const renderPlayButton = () => {
    const { isPendingRelease } = film;

    if (isPendingRelease) {
      return renderAction(
        __('Coming Soon'),
        'clock-outline',
        () => {
          NotificationStore.displayMessage(__('Ожидаем фильм в хорошем качестве...'));
        },
      );
    }

    return renderAction(__('Watch Now'), 'play-outline', playFilm);
  };

  const renderActions = () => (
    <SpatialNavigationView direction="horizontal">
      <DefaultFocus>
        <ThemedView style={ styles.actions }>
          { renderPlayButton() }
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

  const renderGenres = (collection: string[]) => (
    <View style={ styles.collectionContainer }>
      <SpatialNavigationScrollView
        horizontal
      >
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
      </SpatialNavigationScrollView>
    </View>
  );

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

  const renderCollection = (collection: string[], title: string) => (
    <View style={ styles.collectionContainer }>
      <ThemedText style={ styles.collectionTitle }>
        { title }
      </ThemedText>
      <SpatialNavigationScrollView
        horizontal
        offsetFromStart={ scale(20) }
      >
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
      </SpatialNavigationScrollView>
    </View>
  );

  const renderRating = () => {
    const { mainRating, ratingScale } = film;

    if (!mainRating) {
      return null;
    }

    return (
      <Rating
        style={ styles.rating }
        size={ scale(14) }
        rating={ mainRating.rating || 0 }
        scale={ 1 }
        spacing={ scale(2) }
        maxRating={ ratingScale || 10 }
        fillColor={ Colors.secondary }
      />
    );
  };

  const renderDescription = () => {
    const { description } = film;

    return (
      <View>
        <ThemedText style={ styles.description }>
          { description }
        </ThemedText>
        <ThemedButton>
          { __('Read more') }
        </ThemedButton>
      </View>
    );
  };

  const renderMainInfo = () => {
    const {
      title,
      originalTitle,
      releaseDate,
      genres = [],
      countries = [],
      ratings = [],
      directors = [],
      duration,
    } = film;

    return (
      <ThemedCard style={ styles.mainInfo }>
        <ThemedText style={ styles.title }>{ title }</ThemedText>
        { originalTitle && (
          <ThemedText style={ styles.originalTitle }>
            { originalTitle }
          </ThemedText>
        ) }
        { renderGenres(genres) }
        <View style={ styles.additionalInfo }>
          { renderInfoText(releaseDate) }
          { renderInfoText(duration) }
          { renderRating() }
        </View>
        <View style={ styles.ratingsRow }>
          { ratings.map(({ name, rating, votes }) => renderInfoText(`${rating} (${votes})`, name)) }
        </View>
        { renderCollection(directors.map(({ name }) => name), 'Режиссер') }
        { renderCollection(countries, 'Страна') }
        { renderDescription() }
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
        overlayId={ PLAYER_VIDEO_SELECTOR_OVERLAY_ID }
        film={ film }
        onHide={ hideVideoSelector }
        onSelect={ handleVideoSelect }
      />
    );
  };

  const renderActor = (actor: ActorInterface) => {
    const {
      name,
      photo,
      job,
      isDirector,
    } = actor;

    return (
      <SpatialNavigationFocusableView
        key={ name }
      >
        { ({ isFocused }) => (
          <View style={ [styles.actor, isFocused && styles.actorFocused] }>
            <View>
              <ThemedImage
                style={ styles.actorPhoto }
                src={ photo }
              />
              { isDirector && (
                <View style={ styles.director }>
                  <ThemedIcon
                    icon={ {
                      pack: IconPackType.MaterialIcons,
                      name: 'stars',
                    } }
                    size={ scale(12) }
                    color="yellow"
                  />
                  <ThemedText style={ styles.directorText }>
                    { __('Director') }
                  </ThemedText>
                </View>
              ) }
            </View>
            <ThemedText
              style={ [
                styles.actorName,
                isFocused && styles.actorNameFocused,
              ] }
            >
              { name }
            </ThemedText>
            { job && (
              <ThemedText
                style={ [
                  styles.actorJob,
                  isFocused && styles.actorNameFocused,
                ] }
              >
                { job }
              </ThemedText>
            ) }
          </View>
        ) }
      </SpatialNavigationFocusableView>
    );
  };

  const renderActors = () => {
    const { directors = [], actors = [], genres = [] } = film;

    const persons = [...directors, ...actors];

    if (!persons.length) {
      return null;
    }

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Actors') }
        </ThemedText>
        <View style={ styles.actorsListWrapper }>
          <SpatialNavigationScrollView
            horizontal
          >
            <SpatialNavigationView
              style={ styles.collection }
              direction="horizontal"
            >
              { persons.map((item) => renderActor(item)) }
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
        </View>
      </View>
    );
  };

  const renderScheduleItem = (item: ScheduleItemInterface, idx: number) => {
    const {
      name,
      episodeName,
      episodeNameOriginal,
      date,
      releaseDate,
      isWatched,
      isReleased,
    } = item;

    return (
      <SpatialNavigationFocusableView
        key={ name }
      >
        { ({ isFocused }) => (
          <View
            style={ [
              styles.scheduleItem,
              idx % 2 === 0 && styles.scheduleItemEven,
              isFocused && styles.scheduleItemFocused,
            ] }
          >
            <View style={ styles.scheduleItemInfoWrapper }>
              <View style={ styles.scheduleItemEpisodeWrapper }>
                <ThemedText style={ [
                  styles.scheduleItemText,
                  styles.scheduleItemEpisodeName,
                ] }
                >
                  { episodeName }
                </ThemedText>
                <ThemedText style={ [
                  styles.scheduleItemText,
                  styles.scheduleItemEpisodeOgName,
                ] }
                >
                  { episodeNameOriginal }
                </ThemedText>
              </View>
              <View style={ styles.scheduleItemNameWrapper }>
                <ThemedText style={ styles.scheduleItemText }>
                  { name }
                </ThemedText>
                <ThemedText style={ styles.scheduleItemText }>
                  { date }
                </ThemedText>
              </View>
            </View>
            <View style={ styles.scheduleItemReleaseWrapper }>
              { isReleased ? (
                <TouchableOpacity
                  onPress={ () => console.log('watch') }
                >
                  <ThemedIcon
                    style={ styles.scheduleItemMarkIcon }
                    icon={ {
                      name: 'checkbox-marked-circle-outline',
                      pack: IconPackType.MaterialCommunityIcons,
                    } }
                    size={ scale(32) }
                    color={ isWatched ? Colors.secondary : Colors.white }
                  />
                </TouchableOpacity>
              ) : (
                <ThemedText style={ [
                  styles.scheduleItemText,
                  styles.scheduleItemReleaseDate,
                ] }
                >
                  { releaseDate }
                </ThemedText>
              ) }
            </View>
          </View>
        ) }
      </SpatialNavigationFocusableView>
    );
  };

  const renderSchedule = () => {
    const { schedule = [] } = film;

    if (!schedule.length) {
      return null;
    }

    const data = schedule.map((item) => ({
      id: item.name,
      title: item.name,
      items: item.items,
    }));

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Schedule') }
        </ThemedText>
        <ThemedAccordion
          data={ data }
          renderItem={ renderScheduleItem }
        />
      </View>
    );
  };

  const renderFranchiseItem = (item: FranchiseItem, idx: number) => {
    const { franchise = [] } = film;
    const {
      name,
      year,
      rating,
      link,
    } = item;
    const position = Math.abs(idx - franchise.length);

    return (
      <SpatialNavigationFocusableView
        key={ item.name }
        // onPress={ () => handleSelectFilm(link) }
      >
        { ({ isFocused }) => (
          <View style={ [styles.franchiseItem, isFocused && styles.franchiseItemFocused] }>
            <ThemedText style={ styles.franchiseText }>
              { position }
            </ThemedText>
            <ThemedText
              style={ [
                styles.franchiseText,
                styles.franchiseName,
                !link && styles.franchiseSelected,
              ] }
            >
              { name }
            </ThemedText>
            <ThemedText style={ styles.franchiseText }>
              { year }
            </ThemedText>
            <ThemedText style={ styles.franchiseText }>
              { rating }
            </ThemedText>
          </View>
        ) }

      </SpatialNavigationFocusableView>
    );
  };

  const renderFranchise = () => {
    const { franchise = [] } = film;

    if (!franchise.length) {
      return null;
    }

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Franchise') }
        </ThemedText>
        <View style={ styles.franchiseList }>
          { franchise.map((item, idx) => renderFranchiseItem(item, idx)) }
        </View>
      </View>
    );
  };

  const renderInfoList = (list: InfoListInterface, idx: number) => {
    const { name, position, link } = list;

    return (
      <SpatialNavigationFocusableView
        key={ name }
        // onPress={ () => console.log('info-list', link) }
      >
        { ({ isFocused }) => (
          <View style={ [
            styles.infoList,
            idx % 2 === 0 && styles.infoListEven,
            isFocused && styles.infoListFocused,
          ] }
          >
            <ThemedText style={ styles.infoListName }>
              { `${name} ${position || ''}` }
            </ThemedText>
          </View>
        ) }
      </SpatialNavigationFocusableView>
    );
  };

  const renderInfoLists = () => {
    const { includedIn = [], fromCollections = [] } = film;

    if (!includedIn.length && !fromCollections.length) {
      return null;
    }

    const data = [];

    if (includedIn.length) {
      data.push({
        id: 'included-in',
        title: __('Included in the lists'),
        items: includedIn,
      });
    }

    if (fromCollections.length) {
      data.push({
        id: 'from-collections',
        title: __('From collections'),
        items: fromCollections,
      });
    }

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Included in') }
        </ThemedText>
        <ThemedAccordion
          data={ data }
          renderItem={ renderInfoList }
        />
      </View>
    );
  };

  const renderRelatedItem = (item: FilmCardInterface, idx: number) => (
    <SpatialNavigationFocusableView
      key={ `${film.id}-${idx}` }
    >
      { ({ isFocused }) => (
        <FilmCard
          filmCard={ item }
          isFocused={ isFocused }
          style={ styles.relatedListItem }
          stylePoster={ styles.relatedListItemPoster }
        />
      ) }
    </SpatialNavigationFocusableView>
  );

  const renderRelated = () => {
    const { related = [] } = film;

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Watch also') }
        </ThemedText>
        <View style={ styles.relatedListWrapper }>
          <SpatialNavigationScrollView
            horizontal
            offsetFromStart={ scale(20) }
          >
            <SpatialNavigationView
              style={ styles.relatedList }
              direction="horizontal"
            >
              { related.map((item, idx) => renderRelatedItem(item, idx)) }
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
        </View>
      </View>
    );
  };

  const renderModals = () => renderPlayerVideoSelector();

  return (
    <Page testID="film-page">
      <SpatialNavigationScrollView offsetFromStart={ height / 2.1 }>
        <View>
          { renderModals() }
          { renderActions() }
          { renderMainContent() }
          { renderActors() }
          { renderSchedule() }
          { renderFranchise() }
          { renderInfoLists() }
          { renderRelated() }
        </View>
      </SpatialNavigationScrollView>
    </Page>
  );
}

export default FilmPageComponent;
