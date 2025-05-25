import { Rating } from '@kolking/react-native-rating';
import BookmarksSelector from 'Component/BookmarksSelector';
import Comments from 'Component/Comments';
import { CommentsRef } from 'Component/Comments/Comments.container';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImageModal from 'Component/ThemedImageModal';
import ThemedOverlay from 'Component/ThemedOverlay';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import { useRouter } from 'expo-router';
import t from 'i18n/t';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { Colors } from 'Style/Colors';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';
import { isCloseToBottom } from 'Util/Scroll';

import { SCROLL_EVENT_END_PADDING } from './FilmPage.config';
import { styles } from './FilmPage.style';
import { FilmPageThumbnail } from './FilmPage.thumbnail';
import { FilmPageComponentProps } from './FilmPage.type';
import {
  ActorView, FranchiseItemComponent,
  InfoList,
  RelatedItem,
  ScheduleItem,
  Section,
} from './FilmPageElements';

export function FilmPageComponent({
  film,
  visibleScheduleItems,
  playerVideoSelectorOverlayId,
  scheduleOverlayId,
  bookmarksOverlayId,
  playFilm,
  hideVideoSelector,
  handleVideoSelect,
  handleSelectFilm,
  handleSelectActor,
  handleSelectCategory,
  handleUpdateScheduleWatch,
  handleShare,
}: FilmPageComponentProps) {
  const router = useRouter();
  const { openOverlay, goToPreviousOverlay } = useOverlayContext();
  const [commentsVisible, setCommentsVisible] = useState(false);
  const commentsRef = useRef<CommentsRef>(null);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const closePadding = commentsVisible
        ? SCROLL_EVENT_END_PADDING * 4
        : SCROLL_EVENT_END_PADDING;

      if (isCloseToBottom(event, closePadding)) {
        if (commentsVisible) {
          commentsRef.current?.loadComments();
        } else {
          setCommentsVisible(true);
        }
      }
    }, [commentsVisible]
  );

  if (!film) {
    return <FilmPageThumbnail />;
  }

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      <ThemedPressable
        style={ styles.topActionsButton }
        onPress={ () => router.back() }
        mode='dark'
      >
        <ArrowLeft
          size={ scale(24) }
          color={ Colors.white }
        />
      </ThemedPressable>
      <ThemedPressable
        style={ styles.topActionsButton }
        onPress={ handleShare }
        mode='dark'
      >
        <Share2
          size={ scale(24) }
          color={ Colors.white }
        />
      </ThemedPressable>
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
          { genres.map(({ name, link }) => (
            <TouchableHighlight
              key={ name }
              onPress={ () => handleSelectCategory(link) }
            >
              <ThemedText style={ styles.genre }>
                { name }
              </ThemedText>
            </TouchableHighlight>
          )) }
        </View>
      </ScrollView>
    );
  };

  const renderPoster = () => {
    const { poster, largePoster } = film;

    return (
      <ThemedImageModal
        src={ poster }
        modalSrc={ largePoster }
        style={ styles.posterWrapper }
        imageStyle={ styles.poster }
      />
    );
  };

  const renderInfoText = (text: string | undefined, title?: string) => {
    if (!text) {
      return null;
    }

    return (
      <Text
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
      </Text>
    );
  };

  const renderCollection = (
    collection: CollectionItemInterface[],
    title: string,
    handler?: (link: string) => void
  ) => {
    if (!collection.length) {
      return null;
    }

    return (
      <View style={ styles.collectionContainer }>
        <ThemedText style={ styles.collectionTitle }>
          { `${title}: ` }
        </ThemedText>
        { collection.map(({ name, link }) => (
          <TouchableOpacity
            key={ name }
            style={ styles.collectionButton }
            onPress={ () => handler && handler(link) }
          >
            <ThemedText
              style={ styles.collectionButtonText }
            >
              { name }
            </ThemedText>
          </TouchableOpacity>
        )) }
      </View>
    );
  };

  const renderDirectors = () => {
    const { directors = [] } = film;

    const items = directors.map(({ name, link }) => ({ name, link: link || '' }));

    return renderCollection(items, t('Director'), handleSelectActor);
  };

  const renderMainInfo = () => {
    const {
      releaseDate,
      ratings = [],
      countries = [],
      duration,
    } = film;

    return (
      <View style={ styles.mainInfo }>
        { ratings.map(({ name, rating, votes }) => renderInfoText(`${rating} (${votes})`, name)) }
        { renderInfoText(releaseDate, t('Release date')) }
        { renderInfoText(duration, t('Time')) }
        { renderRating() }
        { renderDirectors() }
        { renderCollection(countries, t('Country'), handleSelectCategory) }
      </View>
    );
  };

  const renderMainContent = () => (
    <View style={ styles.mainContent }>
      { renderPoster() }
      { renderMainInfo() }
    </View>
  );

  const renderDescription = () => {
    const { description } = film;

    return <ThemedText style={ styles.description }>{ description }</ThemedText>;
  };

  const renderPlayFilmButton = () => {
    const { isPendingRelease } = film;

    if (isPendingRelease) {
      return (
        <View style={ styles.pendingRelease }>
          <ThemedIcon
            style={ styles.pendingReleaseIcon }
            icon={ {
              pack: IconPackType.MaterialCommunityIcons,
              name: 'clock-outline',
            } }
            size={ scale(32) }
            color="white"
          />
          <ThemedText style={ styles.pendingReleaseText }>
            { t('We are waiting for the film in the good quality') }
          </ThemedText>
        </View>
      );
    }

    return (
      <ThemedButton
        style={ styles.playBtn }
        onPress={ playFilm }
      >
        { t('Watch Now') }
      </ThemedButton>
    );
  };

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
      { renderAction(t('Trailer'), 'movie-open-check-outline', () => NotificationStore.displayMessage(t('Not implemented'))) }
      { renderAction(t('Bookmark'), 'movie-star-outline', () => openOverlay(bookmarksOverlayId)) }
      { renderAction(t('Download'), 'folder-download-outline', () => NotificationStore.displayMessage(t('Not implemented'))) }
    </View>
  );

  const renderRating = () => {
    const { mainRating, ratingScale } = film;

    if (!mainRating) {
      return null;
    }

    return (
      <View style={ styles.rating }>
        <Rating
          size={ scale(12) }
          rating={ mainRating.rating || 0 }
          scale={ 1 }
          spacing={ scale(2) }
          maxRating={ ratingScale || 10 }
          fillColor={ Colors.secondary }
        />
      </View>
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
        <ScrollView horizontal>
          <View style={ styles.actorsList }>
            { persons.map((actor, index) => (
              <ActorView
                // eslint-disable-next-line react/no-array-index-key
                key={ `actor-${actor.name}-${index}` }
                actor={ actor }
                handleSelectActor={ handleSelectActor }
              />
            )) }
          </View>
        </ScrollView>
      </Section>
    );
  };

  const renderScheduleOverlay = () => {
    const { schedule = [] } = film;

    return (
      <ThemedOverlay
        id={ scheduleOverlayId }
        onHide={ () => goToPreviousOverlay() }
      >
        <ScrollView>
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
                    handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
                  />
                )) }
              </View>
            </View>
          )) }
        </ScrollView>
      </ThemedOverlay>
    );
  };

  const renderSchedule = () => {
    const { schedule = [] } = film;

    if (!schedule.length) {
      return null;
    }

    return (
      <Section title={ t('Schedule') }>
        <View style={ styles.visibleScheduleItems }>
          { visibleScheduleItems.map((item: ScheduleItemInterface, idx: number) => (
            <ScheduleItem
              key={ `schedule-visible-${item.name}` }
              item={ item }
              idx={ idx }
              handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
            />
          )) }
        </View>
        <ThemedButton
          onPress={ () => openOverlay(scheduleOverlayId) }
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
              item={ item }
              idx={ idx }
              film={ film }
              handleSelectFilm={ handleSelectFilm }
            />
          )) }
        </View>
      </Section>
    );
  };

  const renderRelated = () => {
    const { related = [] } = film;

    return (
      <Section title={ t('Related') }>
        <ScrollView horizontal>
          <View style={ styles.relatedList }>
            { related.map((item, idx) => (
              <RelatedItem
                // eslint-disable-next-line react/no-array-index-key -- idx is unique
                key={ `${item.id}-${idx}` }
                item={ item }
                handleSelectFilm={ handleSelectFilm }
              />
            )) }
          </View>
        </ScrollView>
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
        <View>
          { data.map(({ id, title, items }, index) => (
            <View key={ id }>
              <ThemedText style={ [
                styles.infoListHeader,
                index > 0 && { marginTop: scale(16) },
              ] }
              >
                { title }
              </ThemedText>
              <View>
                { items.map((subItem, idx) => (
                  <InfoList
                    key={ `info-list-${subItem.name}` }
                    list={ subItem }
                    idx={ idx }
                    handleSelectCategory={ handleSelectCategory }
                  />
                )) }
              </View>
            </View>
          )) }
        </View>
      </Section>
    );
  };

  const renderPlayerVideoSelector = () => {
    const { voices = [], hasVoices, hasSeasons } = film;

    if (!voices.length || (!hasVoices && !hasSeasons)) {
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

  const renderComments = () => {
    if (!commentsVisible) {
      return null;
    }

    return (
      <View>
        <ScrollView
          horizontal
          contentContainerStyle={ { width: '100%', height: '100%' } }
        >
          <Section title={ t('Comments') }>
            <Comments
              ref={ commentsRef }
              film={ film }
            />
          </Section>
        </ScrollView>
      </View>
    );
  };

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
    </>
  );

  return (
    <Page>
      <ScrollView onScroll={ onScroll }>
        { renderModals() }
        { renderTopActions() }
        { renderTitle() }
        { renderGenres() }
        { renderMainContent() }
        { renderDescription() }
        { renderActions() }
        { renderPlayFilmButton() }
        { renderActors() }
        { renderFranchise() }
        { renderSchedule() }
        { renderInfoLists() }
        { renderRelated() }
        { renderComments() }
      </ScrollView>
    </Page>
  );
}

export default FilmPageComponent;
