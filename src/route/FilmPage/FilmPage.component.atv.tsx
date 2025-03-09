import { Rating } from '@kolking/react-native-rating';
import BookmarksSelector from 'Component/BookmarksSelector';
import Comments from 'Component/Comments';
import Loader from 'Component/Loader';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedAccordion from 'Component/ThemedAccordion';
import ThemedButton from 'Component/ThemedButton';
import ThemedCard from 'Component/ThemedCard';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import Thumbnail from 'Component/Thumbnail';
import __ from 'i18n/__';
import { Dimensions, View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import OverlayStore from 'Store/Overlay.store';
import Colors from 'Style/Colors';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmPage.style.atv';
import { FilmPageComponentProps } from './FilmPage.type';
import {
  ActorView, FranchiseItemComponent, InfoList, RelatedItem, ScheduleItem, Section,
} from './FilmPageElements.atv';

export function FilmPageComponent({
  film,
  visibleScheduleItems,
  playerVideoSelectorOverlayId,
  scheduleOverlayId,
  commentsOverlayId,
  bookmarksOverlayId,
  playFilm,
  hideVideoSelector,
  handleVideoSelect,
  handleSelectFilm,
  handleSelectActor,
  handleSelectCategory,
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
        disableRootActive
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
          NotificationStore.displayMessage(__('We are waiting for the film in the good quality'));
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
          { renderAction(__('Comments'), 'comment-text-multiple-outline', () => OverlayStore.openOverlay(commentsOverlayId)) }
          { renderAction(__('Bookmark'), 'movie-star-outline', () => OverlayStore.openOverlay(bookmarksOverlayId)) }
          { renderAction(__('Trailer'), 'movie-open-check-outline') }
          { renderAction(__('Share'), 'share-variant-outline') }
          { renderAction(__('Download'), 'folder-download-outline') }
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

  const renderGenres = () => {
    const { genres = [] } = film;

    return (
      <View style={ styles.collectionContainer }>
        <SpatialNavigationScrollView
          horizontal
        >
          <SpatialNavigationView
            style={ styles.collection }
            direction="horizontal"
          >
            { genres.map(({ name, link }) => (
              <ThemedButton
                key={ name }
                style={ styles.collectionButton }
                textStyle={ styles.collectionButtonText }
                onPress={ () => handleSelectCategory(link) }
              >
                { name }
              </ThemedButton>
            )) }
          </SpatialNavigationView>
        </SpatialNavigationScrollView>
      </View>
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

  const renderRatings = () => {
    const { ratings = [] } = film;

    return (
      <View style={ styles.ratingsRow }>
        { ratings.map(({ name, rating, votes }) => renderInfoText(`${rating} (${votes})`, name)) }
      </View>
    );
  };

  const renderCollection = (
    collection: CollectionItemInterface[],
    title: string,
    handler?: (link: string) => void,
  ) => (
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
          { collection.map(({ name, link }) => (
            <ThemedButton
              key={ name }
              style={ styles.collectionButton }
              textStyle={ styles.collectionButtonText }
              onPress={ () => handler && handler(link) }
            >
              { name }
            </ThemedButton>
          )) }
        </SpatialNavigationView>
      </SpatialNavigationScrollView>
    </View>
  );

  const renderDirectors = () => {
    const { directors = [] } = film;

    const items = directors.map(({ name, link }) => ({ name, link: link || '' }));

    return renderCollection(items, __('Director'), handleSelectActor);
  };

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
      countries = [],
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
        { renderGenres() }
        <View style={ styles.additionalInfo }>
          { renderInfoText(releaseDate) }
          { renderInfoText(duration) }
          { renderRating() }
        </View>
        { renderRatings() }
        { renderDirectors() }
        { renderCollection(countries, __('Country'), handleSelectCategory) }
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
        overlayId={ playerVideoSelectorOverlayId }
        film={ film }
        onHide={ hideVideoSelector }
        onSelect={ handleVideoSelect }
      />
    );
  };

  const renderActors = () => {
    const { directors = [], actors = [] } = film;

    const persons = [...directors, ...actors];

    if (!persons.length) {
      return null;
    }

    return (
      <Section title={ __('Actors') }>
        <View style={ styles.actorsListWrapper }>
          <SpatialNavigationScrollView
            horizontal
            offsetFromStart={ Dimensions.get('window').width / 2 }
          >
            <SpatialNavigationView
              style={ styles.collection }
              direction="horizontal"
            >
              { persons.map((actor, index) => (
                <ActorView
                  // eslint-disable-next-line react/no-array-index-key
                  key={ `actor-${actor.name}-${index}` }
                  actor={ actor }
                  handleSelectActor={ handleSelectActor }
                />
              )) }
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
        </View>
      </Section>
    );
  };

  const renderScheduleOverlay = () => {
    const { schedule = [] } = film;

    return (
      <ThemedOverlay
        id={ scheduleOverlayId }
        onHide={ () => OverlayStore.goToPreviousOverlay() }
        containerStyle={ styles.scheduleOverlay }
        contentContainerStyle={ styles.scheduleOverlayContent }
      >
        <SpatialNavigationScrollView
          offsetFromStart={ scale(32) }
        >
          <DefaultFocus>
            { schedule.map(({ name, items }) => (
              <View key={ name }>
                <ThemedText style={ styles.scheduleSeason }>
                  { name }
                </ThemedText>
                <View>
                  { items.map((subItem, idx) => (
                    <ScheduleItem
                      key={ `modal-${subItem.name}` }
                      item={ subItem }
                      idx={ idx }
                    />
                  )) }
                </View>
              </View>
            )) }
          </DefaultFocus>
        </SpatialNavigationScrollView>
      </ThemedOverlay>
    );
  };

  const renderSchedule = () => {
    const { schedule = [] } = film;

    if (!schedule.length) {
      return null;
    }

    return (
      <Section title={ __('Schedule') }>
        <View style={ styles.visibleScheduleItems }>
          <SpatialNavigationScrollView
            offsetFromStart={ scale(32) }
          >
            <DefaultFocus>
              <View>
                { visibleScheduleItems.map((item: ScheduleItemInterface, idx: number) => (
                  <ScheduleItem
                    key={ `visible-${item.name}` }
                    item={ item }
                    idx={ idx }
                  />
                )) }
              </View>
            </DefaultFocus>
          </SpatialNavigationScrollView>
        </View>
        <ThemedButton
          onPress={ () => OverlayStore.openOverlay(scheduleOverlayId) }
          style={ styles.scheduleViewAll }
        >
          { __('View full schedule') }
        </ThemedButton>
      </Section>
    );
  };

  const renderFranchise = () => {
    const { franchise = [] } = film;

    if (!franchise.length) {
      return null;
    }

    return (
      <Section title={ __('Franchise') }>
        <View style={ styles.franchiseList }>
          { franchise.map((item, idx) => (
            <FranchiseItemComponent
              key={ `franchise-${item.link}` }
              film={ film }
              item={ item }
              idx={ idx }
              handleSelectFilm={ handleSelectFilm }
            />
          )) }
        </View>
      </Section>
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
      <Section title={ __('Included in') }>
        <ThemedAccordion
          data={ data }
          renderItem={ (subItem, idx) => (
            <InfoList
              key={ `info-list-${subItem.name}` }
              list={ subItem }
              idx={ idx }
              handleSelectCategory={ handleSelectCategory }
            />
          ) }
        />
      </Section>
    );
  };

  const renderRelated = () => {
    const { related = [] } = film;

    return (
      <Section title={ __('Related') }>
        <View style={ styles.relatedListWrapper }>
          <SpatialNavigationScrollView
            horizontal
            offsetFromStart={ Dimensions.get('window').width / 2 }
          >
            <SpatialNavigationView
              style={ styles.relatedList }
              direction="horizontal"
            >
              { related.map((item) => (
                <RelatedItem
                  key={ item.link }
                  item={ item }
                  handleSelectFilm={ handleSelectFilm }
                />
              )) }
            </SpatialNavigationView>
          </SpatialNavigationScrollView>
        </View>
      </Section>
    );
  };

  const renderCommentsOverlay = () => (
    <ThemedOverlay
      id={ commentsOverlayId }
      onHide={ () => OverlayStore.goToPreviousOverlay() }
      containerStyle={ styles.commentsOverlay }
    >
      <Comments
        style={ styles.commentsOverlayContent }
        film={ film }
      />
    </ThemedOverlay>
  );

  const renderBookmarksOverlay = () => (
    <BookmarksSelector
      overlayId={ bookmarksOverlayId }
      film={ film }
    />
  );

  const renderModals = () => (
    <>
      { renderPlayerVideoSelector() }
      { renderScheduleOverlay() }
      { renderBookmarksOverlay() }
      { renderCommentsOverlay() }
    </>
  );

  return (
    <Page testID="film-page">
      <SpatialNavigationScrollView offsetFromStart={ height / 2.1 }>
        <View>
          { renderModals() }
          { renderActions() }
          { renderMainContent() }
          { renderActors() }
          { renderFranchise() }
          { renderSchedule() }
          { renderInfoLists() }
          { renderRelated() }
        </View>
      </SpatialNavigationScrollView>
    </Page>
  );
}

export default FilmPageComponent;
