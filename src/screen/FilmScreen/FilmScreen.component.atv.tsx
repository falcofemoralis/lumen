import { BookmarksOverlay } from 'Component/BookmarksOverlay';
import { CommentsOverlay } from 'Component/CommentsOverlay';
import { FilmViewActor } from 'Component/FilmViewActor';
import { FilmViewFranchiseItem } from 'Component/FilmViewFranchiseItem';
import { FilmViewInfoListOverlay } from 'Component/FilmViewInfoListOverlay';
import { FilmViewRelatedItem } from 'Component/FilmViewRelatedItem';
import { FilmViewScheduleItem } from 'Component/FilmViewScheduleItem';
import { FilmViewScheduleOverlay } from 'Component/FilmViewScheduleOverlay';
import { FilmViewSection } from 'Component/FilmViewSection';
import { Page } from 'Component/Page';
import { PlayerVideoSelector } from 'Component/PlayerVideoSelector';
import { Rating } from 'Component/Rating';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedGroup } from 'Component/ThemedGroup';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedScrollView } from 'Component/ThemedScrollView';
import { ThemedText } from 'Component/ThemedText';
import { Wrapper } from 'Component/Wrapper';
import { useServiceContext } from 'Context/ServiceContext';
import { useLayout } from 'Hooks/useLayout';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import ArrowRight from 'lucide-react-native/icons/arrow-right';
import Bookmark from 'lucide-react-native/icons/bookmark';
import BookmarkCheck from 'lucide-react-native/icons/bookmark-check';
import Clapperboard from 'lucide-react-native/icons/clapperboard';
import Clock from 'lucide-react-native/icons/clock';
import Download from 'lucide-react-native/icons/download';
import MessageSquareText from 'lucide-react-native/icons/message-square-text';
import Play from 'lucide-react-native/icons/play';
import ShieldOff from 'lucide-react-native/icons/shield-off';
import Star from 'lucide-react-native/icons/star';
import { ComponentType, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { isBookmarked } from 'Util/Film';
import { noopFn } from 'Util/Function';

import { componentStyles } from './FilmScreen.style.atv';
import { FilmScreenThumbnail } from './FilmScreen.thumbnail.atv';
import { FilmScreenComponentProps } from './FilmScreen.type';

export function FilmScreenComponent({
  film,
  visibleScheduleItems,
  playerVideoSelectorOverlayRef,
  scheduleOverlayRef,
  commentsOverlayRef,
  bookmarksOverlayRef,
  descriptionOverlayRef,
  playerVideoDownloaderOverlayRef,
  ratingOverlayRef,
  shouldDisplayContinueWatching,
  playFilm,
  handleVideoSelect,
  handleSelectFilm,
  handleSelectActor,
  handleSelectCategory,
  openBookmarks,
  handleUpdateScheduleWatch,
  openVideoDownloader,
  handleDownloadSelect,
  openTrailerOverlay,
  openRatingOverlay,
  openComments,
  openDescription,
  openSchedule,
  handleRatingSelect,
  continueWatching,
}: FilmScreenComponentProps) {
  const { scale, theme } = useAppTheme();
  const { isSignedIn } = useServiceContext();
  const styles = useThemedStyles(componentStyles);
  const { height } = useWindowDimensions();
  const [showReadMore, setShowReadMore] = useState<boolean | null>(null);
  const { width } = useLayout();
  const [actionsWidth, setActionsWidth] = useState(0);

  if (!film) {
    return (
      <Page>
        <FilmScreenThumbnail styles={ styles } />
      </Page>
    );
  }

  const shouldShowReadMore = (content: number) => {
    const percent = ((content - scale(40)) / height) * 100;

    setShowReadMore(percent > 44);
  };

  const renderAction = (
    IconComponent: ComponentType<any>,
    text?: string,
    onPress?: () => void,
    isDisabled?: boolean
  ) => (
    <ThemedButton
      title={ text ?? '' }
      onPress={ isDisabled ? noopFn : onPress }
      IconComponent={ IconComponent }
      iconProps={ { size: scale(18) } }
      textStyle={ styles.actionButtonText }
      disabled={ isDisabled }
      style={ styles.actionButton }
    />
  );

  const renderPlayButton = () => {
    const { isPendingRelease, isRestricted } = film;

    if (isPendingRelease) {
      return renderAction(
        Clock,
        t('Coming Soon'),
        () => {
          NotificationStore.displayMessage(t('We are waiting for the film in the good quality'));
        }
      );
    }

    if (isRestricted) {
      return renderAction(
        ShieldOff,
        t('Not available'),
        () => {
          NotificationStore.displayMessage(t('Unfortunately, this video is not available in your region'));
        }
      );
    }

    return renderAction(Play, t('Watch Now'), playFilm);
  };

  const renderActions = () => (
    <View style={ [styles.actionsWrapper, actionsWidth <= width && styles.actionsWrapperCentered] }>
      <ThemedScrollView horizontal>
        <View
          style={ styles.actions }
          onLayout={ (e) => setActionsWidth(e.nativeEvent.layout.width) }
        >
          { shouldDisplayContinueWatching && renderAction(ArrowRight, t('Continue Watching'), continueWatching) }
          { renderPlayButton() }
          { renderAction(MessageSquareText, t('Comments'), openComments) }
          { renderAction(Clapperboard, t('Trailer'), openTrailerOverlay) }
          { renderAction(isBookmarked(film) ? BookmarkCheck : Bookmark, t('Bookmark'), openBookmarks) }
          { renderAction(Download, t('Download'), openVideoDownloader) }
          { isSignedIn && renderAction(Star, t('Rate'), openRatingOverlay, film.isRatingPosted) }
        </View>
      </ThemedScrollView>
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

  const renderGenres = () => {
    const { genres = [] } = film;

    return (
      <View style={ styles.collectionContainer }>
        <ThemedScrollView
          horizontal
          style={ styles.collection }
        >
          { genres.map(({ name, link }) => (
            <ThemedButton
              key={ name }
              title={ name }
              style={ styles.collectionButton }
              contentStyle={ styles.collectionButtonContent }
              textStyle={ styles.collectionButtonText }
              onPress={ () => handleSelectCategory(link) }
            />
          )) }
        </ThemedScrollView>
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
    const { ratings = [], mainRating } = film;

    const allRatings = [...ratings];

    if (mainRating) {
      allRatings.push(mainRating);
    }

    if (!allRatings.length) {
      return null;
    }

    return (
      <View style={ styles.ratingsRow }>
        { allRatings.map(({ name, rating, votes }) => renderInfoText(`${rating} (${votes})`, name)) }
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
      <ThemedScrollView
        horizontal
        style={ styles.collection }
      >
        { collection.map(({ name, link }) => (
          <ThemedButton
            key={ name }
            title={ name }
            style={ styles.collectionButton }
            contentStyle={ styles.collectionButtonContent }
            textStyle={ styles.collectionButtonText }
            onPress={ () => handler && handler(link) }
          />
        )) }
      </ThemedScrollView>
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
      <Rating
        ratingContainerStyle={ styles.rating }
        starStyle={ styles.ratingStar }
        size={ scale(14) }
        defaultRating={ Math.round(mainRating.rating || 0) }
        count={ ratingScale || 10 }
        selectedColor={ theme.colors.secondary }
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
            <ThemedButton
              title={ t('Read more') }
              onPress={ openDescription }
            />
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
      <ThemedGroup style={ [styles.card, styles.mainInfo ] }>
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
      </ThemedGroup>
    );
  };

  const renderMainContent = () => (
    <View style={ styles.mainContent }>
      { renderPoster() }
      { renderMainInfo() }
    </View>
  );

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

  const renderActors = () => {
    const { directors = [], actors = [] } = film;

    const persons = [...directors, ...actors];

    if (!persons.length) {
      return null;
    }

    return (
      <FilmViewSection title={ t('Actors') }>
        <View style={ styles.actorsListWrapper }>
          <ThemedScrollView
            horizontal
            style={ styles.actorsCollection }
          >
            { persons.map((actor, index) => (
              <FilmViewActor
                // eslint-disable-next-line react/no-array-index-key
                key={ `actor-${actor.name}-${index}` }
                actor={ actor }
                handleSelectActor={ handleSelectActor }
              />
            )) }
          </ThemedScrollView>
        </View>
      </FilmViewSection>
    );
  };

  const renderScheduleOverlay = () => (
    <FilmViewScheduleOverlay
      ref={ scheduleOverlayRef }
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
      <FilmViewSection title={ t('Schedule') }>
        <ThemedGroup style={ styles.scheduleListWrapper }>
          { visibleScheduleItems.map((item: ScheduleItemInterface) => (
            <FilmViewScheduleItem
              key={ `visible-${item.name}` }
              item={ item }
              handleUpdateScheduleWatch={ handleUpdateScheduleWatch }
            />
          )) }
        </ThemedGroup>
        <ThemedButton
          title={ t('View full schedule') }
          onPress={ openSchedule }
          style={ styles.scheduleViewAll }
        />
      </FilmViewSection>
    );
  };

  const renderFranchise = () => {
    const { franchise = [] } = film;

    if (!franchise.length) {
      return null;
    }

    return (
      <FilmViewSection title={ t('Franchise') }>
        <View>
          { franchise.map((item, idx) => (
            <FilmViewFranchiseItem
              key={ `franchise-${item.link}` }
              film={ film }
              item={ item }
              idx={ idx }
              handleSelectFilm={ handleSelectFilm }
            />
          )) }
        </View>
      </FilmViewSection>
    );
  };

  const renderInfoLists = () => {
    const { includedIn = [], fromCollections = [] } = film;

    if (!includedIn.length && !fromCollections.length) {
      return null;
    }

    return (
      <FilmViewSection title={ t('Included in') }>
        <FilmViewInfoListOverlay
          film={ film }
          handleSelectCategory={ handleSelectCategory }
        />
      </FilmViewSection>
    );
  };

  const renderRelated = () => {
    const { related = [] } = film;

    return (
      <FilmViewSection title={ t('Related') }>
        <ThemedScrollView
          horizontal
          style={ styles.relatedList }
        >
          { related.map((item, idx) => (
            <FilmViewRelatedItem
              // eslint-disable-next-line react/no-array-index-key -- idx is unique
              key={ `${item.id}-${idx}` }
              item={ item }
              handleSelectFilm={ handleSelectFilm }
            />
          )) }
        </ThemedScrollView>
      </FilmViewSection>
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

  const renderModals = () => (
    <>
      { renderPlayerVideoSelector() }
      { renderScheduleOverlay() }
      { renderBookmarksOverlay() }
      { renderCommentsOverlay() }
      { renderDescriptionOverlay() }
      { renderPlayerVideoDownloader() }
      { renderRatingOverlay() }
    </>
  );

  return (
    <Page style={ styles.page }>
      <Wrapper>
        { renderModals() }
        <ThemedScrollView autofocus>
          { renderActions() }
          { renderMainContent() }
          { renderActors() }
          { renderFranchise() }
          { renderSchedule() }
          { renderInfoLists() }
          { renderRelated() }
        </ThemedScrollView>
      </Wrapper>
    </Page>
  );
}

export default FilmScreenComponent;
