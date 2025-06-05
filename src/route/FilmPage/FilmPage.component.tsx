import BookmarksSelector from 'Component/BookmarksSelector';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedButton from 'Component/ThemedButton';
import { ThemedImage } from 'Component/ThemedImage/ThemedImage.component';
import ThemedImageModal from 'Component/ThemedImageModal';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import Wrapper from 'Component/Wrapper';
import { useOverlayContext } from 'Context/OverlayContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import t from 'i18n/t';
import {
  ArrowLeft,
  Bookmark,
  Clapperboard,
  Clock,
  Download,
  MessageSquareText,
  Play,
  Share2,
  Star,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { Colors } from 'Style/Colors';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { FilmInterface } from 'Type/Film.interface';
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
  thumbnailPoster,
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
  const { width } = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollOffset.value = event.contentOffset.y;
  });
  const imageHeight = width * (166 / 250);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-imageHeight, 0, imageHeight],
            [-imageHeight / 2, 0, imageHeight * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-imageHeight, 0, imageHeight], [2, 1, 1]),
        },
      ],
    };
  });

  if (!film) {
    film = null as unknown as FilmInterface; // dirty hack to avoid null checks
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

  const openNotImplemented = () => {
    NotificationStore.displayMessage(t('Not implemented'));
  };

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
            <ThemedPressable
              key={ name }
              style={ styles.genre }
              onPress={ () => handleSelectCategory(link) }
            >
              <ThemedText>
                { name }
              </ThemedText>
            </ThemedPressable>
          )) }
        </View>
      </ScrollView>
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

  const renderDescription = () => {
    const { description } = film;

    return <ThemedText style={ styles.description }>{ description }</ThemedText>;
  };

  const renderMiddleAction = (
    IconComponent: React.ComponentType<any>,
    text: string,
    action?: () => void
  ) => (
    <View style={ styles.middleAction }>
      <ThemedPressable
        style={ styles.middleActionButton }
        onPress={ action }
      >
        <IconComponent
          style={ styles.middleActionIcon }
          size={ scale(20) }
          color={ Colors.white }
        />
      </ThemedPressable>
      <ThemedText style={ styles.middleActionText }>
        { text }
      </ThemedText>
    </View>
  );

  const renderMiddleActions = () => (
    <View style={ styles.middleActions }>
      { renderMiddleAction(Star, 'Rate',openNotImplemented) }
      { renderMiddleAction(Clapperboard, 'Trailer', openNotImplemented) }
      { renderMiddleAction(MessageSquareText, t('Comm'), openComments) }
      { renderMiddleAction(Bookmark, 'Bookmark', () => openOverlay(bookmarksOverlayId)) }
      { renderMiddleAction(Download, 'Download', () => openOverlay(bookmarksOverlayId)) }
    </View>
  );

  const renderPlay = () => {
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

  const renderModals = () => {
    if (!film) {
      return null;
    }

    return (
      <>
        { renderPlayerVideoSelector() }
        { renderBookmarksOverlay() }
      </>
    );
  };

  // NEW

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      <ThemedPressable
        style={ styles.topActionsButton }
        onPress={ () => router.back() }
      >
        <ArrowLeft
          size={ scale(24) }
          color={ Colors.white }
        />
      </ThemedPressable>
      <ThemedPressable
        style={ styles.topActionsButton }
        onPress={ handleShare }
      >
        <Share2
          size={ scale(24) }
          color={ Colors.white }
        />
      </ThemedPressable>
    </View>
  );

  const renderPosterBackground = () => {
    return (
      <Animated.Image
        src={ thumbnailPoster }
        style={ [styles.posterBackground, imageAnimatedStyle] }
        blurRadius={ 5 }
      />
    );
  };

  const renderGradient = () => {
    return (
      <LinearGradient
        style={ styles.backgroundGradient }
        colors={ [Colors.background, Colors.transparent] }
        start={ { x: 0, y: 1 } }
        end={ { x: 0, y: 0 } }
      />
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

  const renderMainInfo = () => {
    const {
      releaseDate,
      countries = [],
      duration,
    } = film;

    return (
      <View style={ styles.mainInfo }>
        { renderRatings() }
        { renderInfoText(releaseDate, t('Release date')) }
        { renderInfoText(duration, t('Time')) }
        { renderDirectors() }
        { renderCollection(countries, t('Country'), handleSelectCategory) }
      </View>
    );
  };

  const renderRatings = () => {
    const { ratings = [] } = film;

    if (!ratings.length) {
      return null;
    }

    return ratings.map(({ name, rating, votes }) => renderInfoText(`${rating} (${votes})`, name));
  };

  const renderContent = () => {
    if (!film) {
      return (
        <FilmPageThumbnail />
      );
    }

    return (
      <View>
        <View style={ styles.upperContent }>
          <Wrapper>
            { renderTopActions() }
            { renderTitle() }
            { renderGenres() }
            <View style={ styles.upperContentWrapper }>
              { renderPoster() }
              <View style={ styles.upperContentInfo }>
                { renderMainInfo() }
              </View>
            </View>
          </Wrapper>
        </View>
        <View style={ styles.middleContent }>
          { renderGradient() }
          <Wrapper>
            { renderMiddleActions() }
          </Wrapper>
        </View>
        <View style={ styles.bottomContent }>
          <View style={ styles.mainContent }>
            <Wrapper>
              { renderDescription() }
              { renderPlay() }
              { renderActors() }
              { renderFranchise() }
              { renderSchedule() }
              { renderInfoLists() }
              { renderRelated() }
            </Wrapper>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Page>
      { renderModals() }
      <Animated.ScrollView
        ref={ scrollRef }
        scrollEnabled={ !!film }
        onScroll={ scrollHandler }
        scrollEventThrottle={ 16 }
      >
        <View>
          { renderPosterBackground() }
          { renderContent() }
        </View>
      </Animated.ScrollView>
    </Page>
  );
}

export default FilmPageComponent;
