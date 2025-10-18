import { AirbnbRating } from '@rn-vui/ratings';
import BookmarksOverlay from 'Component/BookmarksOverlay';
import CommentsOverlay from 'Component/CommentsOverlay';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedAccordion from 'Component/ThemedAccordion';
import ThemedButton from 'Component/ThemedButton';
import ThemedImage from 'Component/ThemedImage';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { Bookmark, BookmarkCheck, Clapperboard, Clock, MessageSquareText, Play } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, useWindowDimensions, View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationFocusableView,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import { Colors } from 'Style/Colors';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { FilmInterface } from 'Type/Film.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';
import { isBookmarked } from 'Util/Film';

import { styles } from './FilmPage.style.atv';
import { FilmPageThumbnail } from './FilmPage.thumbnail.atv';
import { FilmPageComponentProps } from './FilmPage.type';
import {
  ActorView, FranchiseItemComponent, InfoList, RelatedItem, ScheduleItem, ScheduleOverlay, Section,
} from './FilmPageElements.atv';

export function FilmPageComponent({
  film,
  visibleScheduleItems,
  playerVideoSelectorOverlayRef,
  scheduleOverlayRef,
  commentsOverlayRef,
  bookmarksOverlayRef,
  descriptionOverlayRef,
  playFilm,
  handleVideoSelect,
  handleSelectFilm,
  handleSelectActor,
  handleSelectCategory,
  openBookmarks,
  handleUpdateScheduleWatch,
  handleBookmarkChange,
}: FilmPageComponentProps) {
  const { height } = useWindowDimensions();
  const [showReadMore, setShowReadMore] = useState<boolean | null>(null);

  if (!film) {
    film = null as unknown as FilmInterface; // dirty hack to avoid null checks
  }

  const shouldShowReadMore = (content: number) => {
    const percent = ((content - scale(40)) / height) * 100;

    setShowReadMore(percent > 44);
  };

  const openNotImplemented = () => {
    NotificationStore.displayMessage(t('Not implemented'));
  };

  const renderAction = (
    IconComponent: React.ComponentType<any>,
    text: string,
    onPress?: () => void
  ) => (
    <ThemedButton
      variant="outlined"
      onPress={ onPress }
      IconComponent={ IconComponent }
      iconProps={ { size: scale(18) } }
      style={ styles.actionButton }
      textStyle={ styles.actionButtonText }
      disableRootActive
      withAnimation
    >
      { text }
    </ThemedButton>
  );

  const renderPlayButton = () => {
    const { isPendingRelease } = film;

    if (isPendingRelease) {
      return renderAction(
        Clock,
        t('Coming Soon'),
        () => {
          NotificationStore.displayMessage(t('We are waiting for the film in the good quality'));
        }
      );
    }

    return renderAction(Play, t('Watch Now'), playFilm);
  };

  const renderActions = () => (
    <SpatialNavigationView direction="horizontal">
      <DefaultFocus>
        <View style={ styles.actions }>
          { renderPlayButton() }
          { renderAction(MessageSquareText, t('Comments'), () => commentsOverlayRef?.current?.open()) }
          { renderAction(isBookmarked(film) ? BookmarkCheck : Bookmark, t('Bookmark'), openBookmarks) }
          { renderAction(Clapperboard, t('Trailer'), openNotImplemented) }
          { /* { renderAction(Download, t('Download'), openNotImplemented) } */ }
        </View>
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
    handler?: (link: string) => void
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

    return renderCollection(items, t('Director'), handleSelectActor);
  };

  const renderRating = () => {
    const { mainRating, ratingScale } = film;

    if (!mainRating) {
      return null;
    }

    return (
      <AirbnbRating
        ratingContainerStyle={ styles.rating }
        starStyle={ styles.ratingStar }
        size={ scale(14) }
        defaultRating={ Math.round(mainRating.rating || 0) }
        count={ ratingScale || 10 }
        selectedColor={ Colors.secondary }
        isDisabled
        showRating={ false }
      />
    );
  };

  const renderDescription = () => {
    const { description } = film;

    return (
      <View onLayout={ (event) => shouldShowReadMore(event.nativeEvent.layout.height) }>
        <ThemedText style={ styles.description }>
          { description }
        </ThemedText>
        { showReadMore !== false && (
          <View
            style={ [
              styles.readMoreButton,
              !showReadMore && styles.readMoreButtonHidden,
            ] }
          >
            <ThemedButton onPress={ () => descriptionOverlayRef?.current?.open() }>
              { t('Read more') }
            </ThemedButton>
          </View>
        ) }
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
      <View style={ [styles.card, styles.mainInfo ] }>
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
        { renderCollection(countries, t('Country'), handleSelectCategory) }
        { renderDescription() }
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
    const { voices = [] } = film;

    if (!voices.length) {
      return null;
    }

    return (
      <PlayerVideoSelector
        overlayRef={ playerVideoSelectorOverlayRef }
        film={ film }
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
      <Section title={ t('Actors') }>
        <View style={ styles.actorsListWrapper }>
          <SpatialNavigationScrollView
            horizontal
            offsetFromStart={ Dimensions.get('window').width / 2 }
          >
            <SpatialNavigationView
              style={ styles.actorsCollection }
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

  const renderScheduleOverlay = () => (
    <ScheduleOverlay
      scheduleOverlayRef={ scheduleOverlayRef }
      film={ film }
      handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
    />
  );

  const renderSchedule = () => {
    const { schedule = [] } = film;

    if (!schedule.length) {
      return null;
    }

    return (
      <Section title={ t('Schedule') }>
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
                    handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
                  />
                )) }
              </View>
            </DefaultFocus>
          </SpatialNavigationScrollView>
        </View>
        <ThemedButton
          onPress={ () => scheduleOverlayRef?.current?.open() }
          style={ styles.scheduleViewAll }
        >
          { t('View full schedule') }
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
      <Section title={ t('Franchise') }>
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
        title: t('Included in the lists'),
        items: includedIn,
      });
    }

    if (fromCollections.length) {
      data.push({
        id: 'from-collections',
        title: t('From collections'),
        items: fromCollections,
      });
    }

    return (
      <Section title={ t('Included in') }>
        <ThemedAccordion
          data={ data }
          overlayContent={ styles.infoListAccordionOverlay }
          renderItem={ (subItem) => (
            <InfoList
              key={ `info-list-${subItem.name}` }
              list={ subItem }
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
      <Section title={ t('Related') }>
        <View style={ styles.relatedListWrapper }>
          <SpatialNavigationScrollView
            horizontal
            offsetFromStart={ Dimensions.get('window').width / 2 }
          >
            <SpatialNavigationView
              style={ styles.relatedList }
              direction="horizontal"
            >
              { related.map((item, idx) => (
                <RelatedItem
                  // eslint-disable-next-line react/no-array-index-key -- idx is unique
                  key={ `${item.id}-${idx}` }
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
    <CommentsOverlay
      overlayRef={ commentsOverlayRef }
      film={ film }
      containerStyle={ styles.commentsOverlay }
      contentStyle={ styles.commentsOverlayContent }
    />
  );

  const renderBookmarksOverlay = () => (
    <BookmarksOverlay
      overlayRef={ bookmarksOverlayRef }
      film={ film }
      onBookmarkChange={ handleBookmarkChange }
    />
  );

  const renderDescriptionOverlay = () => (
    <ThemedOverlay
      ref={ descriptionOverlayRef }
      containerStyle={ styles.descriptionOverlay }
    >
      <ThemedText style={ styles.descriptionOverlayText }>
        { film.description }
      </ThemedText>
    </ThemedOverlay>
  );

  const renderModals = () => (
    <>
      { renderPlayerVideoSelector() }
      { renderScheduleOverlay() }
      { renderBookmarksOverlay() }
      { renderCommentsOverlay() }
      { renderDescriptionOverlay() }
    </>
  );

  const renderContent = () => {
    if (!film) {
      return <FilmPageThumbnail />;
    }

    return (
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
    );
  };

  return (
    <Page testID="film-page" style={ styles.page }>
      { renderContent() }
    </Page>
  );
}

export default FilmPageComponent;
