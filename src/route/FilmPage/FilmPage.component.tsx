import { Rating } from '@kolking/react-native-rating';
import BookmarksSelector from 'Component/BookmarksSelector';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import ThemedImageModal from 'Component/ThemedImageModal';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import { useRouter } from 'expo-router';
import t from 'i18n/t';
import { ArrowLeft, Bookmark, Clapperboard, Clock, Download, MessageSquareText, Play, Share2, Star } from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleProp,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { Colors } from 'Style/Colors';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';

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
  const { openOverlay } = useOverlayContext();

  if (!film) {
    return <FilmPageThumbnail />;
  }

  const openComments = () => {
    router.push({ pathname: '/modal' });
    RouterStore.pushData('modal', {
      type: 'comments',
      film,
    });
  };

  const openSchedule = () => {
    router.push({ pathname: '/modal' });
    RouterStore.pushData('modal', {
      type: 'schedule',
      film,
    });
  };

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

  const renderMiddleAction = (
    IconComponent: React.ComponentType<any>,
    text?: string,
    action?: () => void,
    style?: StyleProp<ViewStyle>
  ) => (
    <ThemedPressable
      style={ [styles.action, style] }
      onPress={ action }
    >
      <IconComponent
        style={ styles.actionIcon }
        size={ scale(18) }
        color={ Colors.white }
      />
      { text && (
        <ThemedText style={ styles.actionText }>
          { text }
        </ThemedText>
      ) }
    </ThemedPressable>
  );

  const renderMiddleActions = () => (
    <View style={ styles.actions }>
      { renderMiddleAction(Star, '3.4k', () => NotificationStore.displayMessage(t('Not implemented')), styles.actionSquare) }
      { renderMiddleAction(Clapperboard, '', () => NotificationStore.displayMessage(t('Not implemented')), styles.actionSquare) }
      { renderMiddleAction(MessageSquareText, t('Comments'), openComments) }
      { renderMiddleAction(Bookmark, '', () => openOverlay(bookmarksOverlayId), styles.actionSquare) }
    </View>
  );

  const renderBottomActions = () => {
    const { isPendingRelease } = film;

    if (isPendingRelease) {
      return (
        <View style={ styles.pendingRelease }>
          <Clock
            style={ styles.pendingReleaseIcon }
            size={ scale(24) }
            color={ Colors.white }
          />
          <ThemedText style={ styles.pendingReleaseText }>
            { t('We are waiting for the film in the good quality') }
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={ styles.actions }>
        <ThemedButton
          style={ styles.playBtn }
          onPress={ playFilm }
          IconComponent={ Play }
          iconProps={ {
            size: scale(18),
            color: Colors.white,
          } }
        >
          { t('Watch Now') }
        </ThemedButton>
        <ThemedPressable
          style={ styles.downloadBtn }
          onPress={ () => NotificationStore.displayMessage(t('Not implemented')) }
        >
          <Download
            style={ styles.downloadBtnIcon }
            size={ scale(18) }
            color={ Colors.white }
          />
        </ThemedPressable>
      </View>
    );
  };

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
              handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
            />
          )) }
        </View>
        <ThemedButton
          onPress={ openSchedule }
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

  const renderBookmarksOverlay = () => (
    <BookmarksSelector
      overlayId={ bookmarksOverlayId }
      film={ film }
    />
  );

  const renderModals = () => (
    <>
      { renderPlayerVideoSelector() }
      { /* { renderScheduleOverlay() } */ }
      { renderBookmarksOverlay() }
    </>
  );

  return (
    <Page>
      <ScrollView>
        { renderModals() }
        { renderTopActions() }
        { renderTitle() }
        { renderGenres() }
        { renderMainContent() }
        { renderMiddleActions() }
        { renderDescription() }
        { renderBottomActions() }
        { renderActors() }
        { renderFranchise() }
        { renderSchedule() }
        { renderInfoLists() }
        { renderRelated() }
      </ScrollView>
    </Page>
  );
}

export default FilmPageComponent;
