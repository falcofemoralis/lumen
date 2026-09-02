import { BookmarksOverlay } from 'Component/BookmarksOverlay';
import { Comments } from 'Component/Comments';
import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from 'Component/FilmCard/FilmCard.config';
import { FilmViewActor } from 'Component/FilmViewActor';
import { FilmViewFranchiseItem } from 'Component/FilmViewFranchiseItem';
import { FilmViewInfoListOverlay } from 'Component/FilmViewInfoListOverlay';
import { FilmViewRelatedItem } from 'Component/FilmViewRelatedItem';
import { FilmViewScheduleItem } from 'Component/FilmViewScheduleItem';
import { FilmViewScheduleOverlay } from 'Component/FilmViewScheduleOverlay';
import { FilmViewSection } from 'Component/FilmViewSection';
import { Header } from 'Component/Header';
import { Loader } from 'Component/Loader';
import { Page } from 'Component/Page';
import { PlayerVideoSelector } from 'Component/PlayerVideoSelector';
import { ThemedBottomSheetRef } from 'Component/ThemedBottomSheet/ThemedBottomSheet.type';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedImageModal } from 'Component/ThemedImageModal';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { useServiceContext } from 'Context/ServiceContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import BellOff from 'lucide-react-native/icons/bell-off';
import Bookmark from 'lucide-react-native/icons/bookmark';
import BookmarkCheck from 'lucide-react-native/icons/bookmark-check';
import Clapperboard from 'lucide-react-native/icons/clapperboard';
import Clock from 'lucide-react-native/icons/clock';
import Download from 'lucide-react-native/icons/download';
import Forward from 'lucide-react-native/icons/forward';
import MessageSquareText from 'lucide-react-native/icons/message-square-text';
import Play from 'lucide-react-native/icons/play';
import ShieldOff from 'lucide-react-native/icons/shield-off';
import Star from 'lucide-react-native/icons/star';
import { ComponentType, useCallback, useRef } from 'react';
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
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { RatingInterface } from 'Type/Rating.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { isBookmarked } from 'Util/Film';
import { noopFn } from 'Util/Function';
import { openLinkInBrowser } from 'Util/Link';

import { NOTIFICATION_ACTION_HIDE, NOTIFICATION_ACTION_REMOVE } from './FilmScreen.config';
import { componentStyles } from './FilmScreen.style';
import { FilmScreenThumbnail } from './FilmScreen.thumbnail';
import { FilmScreenComponentProps } from './FilmScreen.type';

// a real component rather than a render helper: it takes an `action` that reads a bottom
// sheet ref, and a ref-reading closure may only travel as a prop, never as a call argument
const MiddleAction = ({
  styles,
  IconComponent,
  action,
  disabled,
}: {
  styles: ThemedStyles<typeof componentStyles>;
  IconComponent: ComponentType<any>;
  action?: () => void;
  disabled?: boolean;
}) => {
  const { scale, theme } = useAppTheme();

  return (
    <View style={ styles.middleAction }>
      <ThemedPressable
        style={ [
          styles.middleActionButton,
          disabled && styles.middleActionButtonDisabled,
        ] }
        contentStyle={ styles.middleActionContent }
        onPress={ action }
        disabled={ disabled }
      >
        <IconComponent
          style={ styles.middleActionIcon }
          size={ scale(20) }
          color={ theme.colors.icon }
        />
      </ThemedPressable>
    </View>
  );
};

export function FilmScreenComponent({
  film,
  thumbnailPoster,
  visibleScheduleItems,
  playerVideoSelectorOverlayRef,
  bookmarksOverlayRef,
  playerVideoDownloaderOverlayRef,
  isDeepLink,
  ratingOverlayRef,
  notificationsOverlayRef,
  canUnsubscribeNotifications,
  shouldDisplayContinueWatching,
  isContinueWatchingLoading,
  showVotesCount,
  showRecommendations,
  showAgeRating,
  playFilm,
  handleVideoSelect,
  handleSelectFilm,
  handleSelectActor,
  handleSelectCategory,
  handleUpdateScheduleWatch,
  handleShare,
  openBookmarks,
  openVideoDownloader,
  handleDownloadSelect,
  openTrailerOverlay,
  openRatingOverlay,
  openNotificationsOverlay,
  unsubscribeFromNotifications,
  handleRatingSelect,
  continueWatching,
}: FilmScreenComponentProps) {
  const { scale, theme } = useAppTheme();
  const { isSignedIn } = useServiceContext();
  const styles = useThemedStyles(componentStyles);
  const { width } = useWindowDimensions();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollOffset.value = event.contentOffset.y;
  });
  const imageHeight = width * (POSTER_ASPECT_WIDTH / POSTER_ASPECT_HEIGHT);
  const { top } = useSafeAreaInsets();
  const commentsRef = useRef<ThemedBottomSheetRef>(null);
  const scheduleRef = useRef<ThemedBottomSheetRef>(null);

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

  // kept as callbacks so the sheet refs are only read on press, never while rendering
  const openComments = useCallback(() => {
    commentsRef.current?.present();
  }, []);

  const openSchedule = useCallback(() => {
    scheduleRef.current?.present();
  }, []);

  if (!film) {
    return (
      <Page>
        <FilmScreenThumbnail top={ top } styles={ styles } />
      </Page>
    );
  }

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

  const renderMiddleActions = () => (
    <View style={ styles.middleActions }>
      { isSignedIn && (
        <MiddleAction
          styles={ styles }
          IconComponent={ Star }
          action={ openRatingOverlay }
          disabled={ film.isRatingPosted }
        />
      ) }
      <MiddleAction
        styles={ styles }
        IconComponent={ Clapperboard }
        action={ openTrailerOverlay }
      />
      <MiddleAction
        styles={ styles }
        IconComponent={ MessageSquareText }
        action={ openComments }
      />
      <MiddleAction
        styles={ styles }
        IconComponent={ isBookmarked(film) ? BookmarkCheck : Bookmark }
        action={ openBookmarks }
      />
      <MiddleAction
        styles={ styles }
        IconComponent={ Download }
        action={ openVideoDownloader }
      />
      { canUnsubscribeNotifications && (
        <MiddleAction
          styles={ styles }
          IconComponent={ BellOff }
          action={ openNotificationsOverlay }
        />
      ) }
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
      <Wrapper style={ styles.playWrapper }>
        <ThemedButton
          title={ t('Watch Now') }
          style={ styles.playBtn }
          onPress={ playFilm }
          IconComponent={ Play }
          iconProps={ {
            size: scale(18),
            color: theme.colors.iconOnContrast,
          } }
          textStyle={ styles.playBtnText }
        />
        { shouldDisplayContinueWatching && (
          <View>
            <ThemedButton
              title={ t('Continue Watching') }
              style={ styles.continueBtn }
              onPress={ continueWatching }
              IconComponent={ ArrowRight }
              iconProps={ {
                size: scale(18),
                color: theme.colors.secondary,
              } }
              textStyle={ styles.continueBtnText }
              disabled={ isContinueWatchingLoading }
            />
            <Loader fullScreen isLoading={ isContinueWatchingLoading } />
          </View>
        ) }
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
        <FilmViewSection title={ t('Actors') }>
          <ScrollView horizontal showsHorizontalScrollIndicator={ false }>
            <View style={ styles.actorsList }>
              { persons.map((actor, index) => (
                <FilmViewActor
                  // eslint-disable-next-line react/no-array-index-key
                  key={ `actor-${actor.name}-${index}` }
                  actor={ actor }
                  handleSelectActor={ handleSelectActor }
                />
              )) }
            </View>
          </ScrollView>
        </FilmViewSection>
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
        <FilmViewSection title={ t('Schedule') }>
          <View style={ styles.visibleScheduleItems }>
            { visibleScheduleItems.map((item: ScheduleItemInterface, idx: number) => (
              <FilmViewScheduleItem
                key={ `schedule-visible-${item.name}` }
                item={ item }
                handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
              />
            )) }
          </View>
          <ThemedButton
            title={ t('View full schedule') }
            onPress={ openSchedule }
            style={ styles.scheduleViewAll }
          />
        </FilmViewSection>
      </Wrapper>
    );
  };

  const renderFranchise = () => {
    const { franchise = [] } = film;

    if (!franchise.length) {
      return null;
    }

    return (
      <FilmViewSection
        title={ t('Franchise') }
        useHeadingWrapper
      >
        <View style={ styles.franchiseList }>
          { franchise.map((item, idx) => (
            <FilmViewFranchiseItem
              key={ `franchise-${item.link}` }
              item={ item }
              idx={ idx }
              film={ film }
              handleSelectFilm={ handleSelectFilm }
            />
          )) }
        </View>
      </FilmViewSection>
    );
  };

  const renderRelated = () => {
    const { related = [] } = film;

    if (!showRecommendations || !related.length) {
      return null;
    }

    return (
      <Wrapper>
        <FilmViewSection title={ t('Related') }>
          <ScrollView horizontal showsHorizontalScrollIndicator={ false }>
            <View style={ styles.relatedList }>
              { related.map((item, idx) => (
                <FilmViewRelatedItem
                  // eslint-disable-next-line react/no-array-index-key -- idx is unique
                  key={ `${item.id}-${idx}` }
                  item={ item }
                  handleSelectFilm={ handleSelectFilm }
                />
              )) }
            </View>
          </ScrollView>
        </FilmViewSection>
      </Wrapper>
    );
  };

  const renderInfoLists = () => {
    const { includedIn = [], fromCollections = [] } = film;

    if (!includedIn.length && !fromCollections.length) {
      return null;
    }

    return (
      <FilmViewSection
        title={ t('Included in') }
        useHeadingWrapper
      >
        <FilmViewInfoListOverlay
          film={ film }
          handleSelectCategory={ handleSelectCategory }
        />
      </FilmViewSection>
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
    />
  );

  const renderRatingOverlay = () => {
    return (
      <ThemedDropdown
        overlayRef={ ratingOverlayRef }
        data={ Array.from({ length: 10 }, (_, i) => ({
          label: (i + 1).toString(),
          value: String(i + 1),
        })).reverse() }
        onChange={ (item) => handleRatingSelect(Number(item.value)) }
        closeOnChange
        asOverlay
      />
    );
  };

  // Both entries drop the film out of the continue-watching list, which is what the
  // site notifies about -- removing it outright, or marking it watched.
  const renderNotificationsOverlay = () => {
    if (!canUnsubscribeNotifications) {
      return null;
    }

    return (
      <ThemedDropdown
        overlayRef={ notificationsOverlayRef }
        header={ t('Unsubscribe from notifications') }
        data={ [
          {
            label: t('Remove'),
            value: NOTIFICATION_ACTION_REMOVE,
          },
          {
            label: t('Hide'),
            value: NOTIFICATION_ACTION_HIDE,
          },
        ] }
        onChange={ (item) => unsubscribeFromNotifications(item.value) }
        closeOnChange
        asOverlay
      />
    );
  };

  // Owns the sheet itself, so it can hand the composer to TrueSheet as the
  // floating footer that stays on screen at a partly open detent.
  const renderCommentsOverlay = () => (
    <Comments
      sheetRef={ commentsRef }
      film={ film }
      disableRefresh
    />
  );

  const renderScheduleOverlay = () => (
    <FilmViewScheduleOverlay
      ref={ scheduleRef }
      film={ film }
      handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
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
        { renderRatingOverlay() }
        { renderNotificationsOverlay() }
        { renderCommentsOverlay() }
        { renderScheduleOverlay() }
      </>
    );
  };

  const renderTopActions = () => (
    <Header
      additionalAction={ handleShare }
      AdditionalActionIcon={ Forward }
      style={ { paddingTop: top } }
      isDeepLink={ isDeepLink }
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
      age,
    } = film;

    return (
      <View style={ styles.mainInfo }>
        { renderRatings() }
        { renderInfoText(releaseDate, t('Release date')) }
        { renderInfoText(duration, t('Time')) }
        { renderDirectors() }
        { renderCollection(countries, t('Country'), handleSelectCategory) }
        { showAgeRating && renderInfoText(age, t('Age')) }
      </View>
    );
  };

  const renderRating = (rat: RatingInterface, idx: number) => {
    const {
      name,
      rating,
      votes,
      link,
    } = rat;

    return (
      <Text
        key={ name }
        style={ [
          styles.textContainer,
          idx === 0 ? styles.textContainerNoMargin : {},
        ] }
      >
        <ThemedText
          style={ [
            styles.textTitle,
            link ? styles.textLink : {},
          ] }
          onPress={ link ? () => openLinkInBrowser(link) : undefined }
        >
          { `${name}:` }
        </ThemedText>
        <ThemedText
          style={ styles.text }
        >
          { showVotesCount ? ` ${rating} (${votes})` : ` ${rating}` }
        </ThemedText>
      </Text>
    );
  };

  const renderRatings = () => {
    const { ratings = [], mainRating } = film;

    const allRatings = [...ratings];

    if (mainRating) {
      allRatings.push(mainRating);
    }

    if (!allRatings.length) {
      return null;
    }

    return allRatings.map(renderRating);
  };

  const renderContent = () => (
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
