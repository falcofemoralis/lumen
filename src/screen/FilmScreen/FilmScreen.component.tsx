import { BookmarksOverlay } from 'Component/BookmarksOverlay';
import { Header } from 'Component/Header';
import { Page } from 'Component/Page';
import { PlayerVideoSelector } from 'Component/PlayerVideoSelector';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedImageModal } from 'Component/ThemedImageModal';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import {
  Bookmark,
  BookmarkCheck,
  Clapperboard,
  Clock,
  Download,
  Forward,
  MessageSquareText,
  Play,
  ShieldOff,
  Star,
} from 'lucide-react-native';
import { COMMENTS_MODAL_SCREEN, SCHEDULE_MODAL_SCREEN } from 'Navigation/navigationRoutes';
import {
  ScrollView,
  Text,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { useAppTheme } from 'Theme/context';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { FilmInterface } from 'Type/Film.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { isBookmarked } from 'Util/Film';
import { noopFn } from 'Util/Function';
import { navigate } from 'Util/Navigation';

import { componentStyles } from './FilmScreen.style';
import { FilmScreenThumbnail } from './FilmScreen.thumbnail';
import { FilmScreenComponentProps } from './FilmScreen.type';
import {
  ActorView, FranchiseItemComponent,
  InfoList,
  RelatedItem,
  ScheduleItem,
  Section,
} from './FilmScreenElements';

export function FilmScreenComponent({
  film,
  thumbnailPoster,
  visibleScheduleItems,
  playerVideoSelectorOverlayRef,
  bookmarksOverlayRef,
  playerVideoDownloaderOverlayRef,
  playFilm,
  handleVideoSelect,
  handleSelectFilm,
  handleSelectActor,
  handleSelectCategory,
  handleUpdateScheduleWatch,
  handleShare,
  openBookmarks,
  handleBookmarkChange,
  openVideoDownloader,
  handleDownloadSelect,
  openTrailerOverlay,
}: FilmScreenComponentProps) {
  const { scale, theme } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { width } = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollOffset.value = event.contentOffset.y;
  });
  const imageHeight = width * (166 / 250);
  const { top } = useSafeAreaInsets();

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
    RouterStore.pushData(COMMENTS_MODAL_SCREEN, { film });
    navigate(COMMENTS_MODAL_SCREEN);
  };

  const openSchedule = () => {
    RouterStore.pushData(SCHEDULE_MODAL_SCREEN, {
      film,
      handleUpdateScheduleWatch,
    });
    navigate(SCHEDULE_MODAL_SCREEN);
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
      <ScrollView horizontal showsHorizontalScrollIndicator={ false }>
        <View style={ styles.genres }>
          { genres.map(({ name, link }) => (
            <ThemedPressable
              key={ name }
              style={ styles.genre }
              contentStyle={ styles.genreContent }
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

  const renderInfoText = (text: string | undefined, title?: string, noMargin?: boolean) => {
    if (!text) {
      return null;
    }

    return (
      <Text
        key={ text }
        style={ [
          styles.textContainer,
          noMargin ? styles.textContainerNoMargin : {},
        ] }
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
          <ThemedPressable
            key={ name }
            style={ styles.collectionButton }
            contentStyle={ styles.collectionButtonContent }
            onPress={ () => handler && handler(link) }
          >
            <ThemedText
              style={ styles.collectionButtonText }
            >
              { name }
            </ThemedText>
          </ThemedPressable>
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

    return (
      <Wrapper>
        <ThemedText style={ styles.description }>
          { description }
        </ThemedText>
      </Wrapper>
    );
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
          color={ theme.colors.icon }
        />
      </ThemedPressable>
      { /* <ThemedText style={ styles.middleActionText }>
        { text }
      </ThemedText> */ }
    </View>
  );

  const renderMiddleActions = () => (
    <View style={ styles.middleActions }>
      { renderMiddleAction(Star, 'Rate', openNotImplemented) }
      { renderMiddleAction(Clapperboard, 'Trailer', openTrailerOverlay) }
      { renderMiddleAction(MessageSquareText, 'Comments', openComments) }
      { renderMiddleAction(isBookmarked(film) ? BookmarkCheck : Bookmark, 'Bookmark', openBookmarks) }
      { renderMiddleAction(Download, 'Download', openVideoDownloader) }
    </View>
  );

  const renderPlay = () => {
    const { isPendingRelease, isRestricted } = film;

    if (isPendingRelease) {
      return (
        <Wrapper style={ styles.pendingRelease }>
          <Clock
            style={ styles.pendingReleaseIcon }
            size={ scale(24) }
            color={ theme.colors.icon }
          />
          <ThemedText style={ styles.pendingReleaseText }>
            { t('We are waiting for the film in the good quality') }
          </ThemedText>
        </Wrapper>
      );
    }

    if (isRestricted) {
      return (
        <Wrapper style={ styles.pendingRelease }>
          <ShieldOff
            style={ styles.pendingReleaseIcon }
            size={ scale(24) }
            color={ theme.colors.icon }
          />
          <ThemedText style={ styles.pendingReleaseText }>
            { t('Unfortunately, this video is not available in your region') }
          </ThemedText>
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <ThemedButton
          style={ styles.playBtn }
          onPress={ playFilm }
          IconComponent={ Play }
          iconProps={ {
            size: scale(18),
            color: theme.colors.iconOnContrast,
          } }
          textStyle={ styles.playBtnText }
        >
          { t('Watch Now') }
        </ThemedButton>
      </Wrapper>
    );
  };

  const renderActors = () => {
    const { directors = [], actors = [] } = film;

    const persons = [...directors, ...actors];

    if (!persons.length) {
      return null;
    }

    return (
      <Wrapper>
        <Section title={ t('Actors') } styles={ styles }>
          <ScrollView horizontal showsHorizontalScrollIndicator={ false }>
            <View style={ styles.actorsList }>
              { persons.map((actor, index) => (
                <ActorView
                  // eslint-disable-next-line react/no-array-index-key
                  key={ `actor-${actor.name}-${index}` }
                  actor={ actor }
                  handleSelectActor={ handleSelectActor }
                  styles={ styles }
                />
              )) }
            </View>
          </ScrollView>
        </Section>
      </Wrapper>
    );
  };

  const renderSchedule = () => {
    const { schedule = [] } = film;

    if (!schedule.length) {
      return null;
    }

    return (
      <Wrapper>
        <Section title={ t('Schedule') } styles={ styles }>
          <View style={ styles.visibleScheduleItems }>
            { visibleScheduleItems.map((item: ScheduleItemInterface, idx: number) => (
              <ScheduleItem
                key={ `schedule-visible-${item.name}` }
                item={ item }
                handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
                styles={ styles }
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
      </Wrapper>
    );
  };

  const renderFranchise = () => {
    const { franchise = [] } = film;

    if (!franchise.length) {
      return null;
    }

    return (
      <Section
        title={ t('Franchise') }
        useHeadingWrapper
        styles={ styles }
      >
        <View style={ styles.franchiseList }>
          { franchise.map((item, idx) => (
            <FranchiseItemComponent
              key={ `franchise-${item.link}` }
              item={ item }
              idx={ idx }
              film={ film }
              handleSelectFilm={ handleSelectFilm }
              styles={ styles }
            />
          )) }
        </View>
      </Section>
    );
  };

  const renderRelated = () => {
    const { related = [] } = film;

    return (
      <Wrapper>
        <Section title={ t('Related') } styles={ styles }>
          <ScrollView horizontal showsHorizontalScrollIndicator={ false }>
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
      </Wrapper>
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
      <Section
        title={ t('Included in') }
        useHeadingWrapper
        styles={ styles }
      >
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
                    handleSelectCategory={ handleSelectCategory }
                    styles={ styles }
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
    return (
      <PlayerVideoSelector
        ref={ playerVideoSelectorOverlayRef }
        film={ film }
        onSelect={ handleVideoSelect }
      />
    );
  };

  const renderPlayerVideoDownloader = () => {
    return (
      <PlayerVideoSelector
        ref={ playerVideoDownloaderOverlayRef }
        film={ film }
        onSelect={ noopFn }
        onDownloadSelect={ handleDownloadSelect }
        isDownloader
      />
    );
  };

  const renderBookmarksOverlay = () => (
    <BookmarksOverlay
      overlayRef={ bookmarksOverlayRef }
      film={ film }
      onBookmarkChange={ handleBookmarkChange }
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
        { renderPlayerVideoDownloader() }
      </>
    );
  };

  const renderTopActions = () => (
    <Header
      additionalAction={ handleShare }
      AdditionalActionIcon={ Forward }
      style={ { paddingTop: top } }
    />
  );

  const renderPosterBackground = () => {
    return (
      <Animated.Image
        src={ thumbnailPoster ?? film?.poster }
        style={ [
          styles.posterBackground,
          {
            height: theme.dimensions.height,
            width: theme.dimensions.width,
          },
          imageAnimatedStyle,
        ] }
        blurRadius={ 5 }
      />
    );
  };

  const renderGradient = () => {
    return (
      <LinearGradient
        style={ styles.backgroundGradient }
        colors={ [theme.colors.background, theme.colors.transparent] }
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

    return ratings.map(({ name, rating, votes }, i) => renderInfoText(`${rating} (${votes})`, name, i === 0));
  };

  const renderContent = () => {
    if (!film) {
      return (
        <FilmScreenThumbnail top={ top } styles={ styles } />
      );
    }

    return (
      <View style={ styles.page }>
        <View style={ styles.upperContent }>
          { renderTopActions() }
          <Wrapper>
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
            { renderDescription() }
            { renderPlay() }
            { renderActors() }
            { renderFranchise() }
            { renderSchedule() }
            { renderInfoLists() }
            { renderRelated() }
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
        showsVerticalScrollIndicator={ false }
      >
        <View>
          { renderPosterBackground() }
          { renderContent() }
        </View>
      </Animated.ScrollView>
    </Page>
  );
}

export default FilmScreenComponent;
