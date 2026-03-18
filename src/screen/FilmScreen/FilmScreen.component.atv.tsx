import { BookmarksOverlay } from 'Component/BookmarksOverlay';
import { CommentsOverlay } from 'Component/CommentsOverlay';
import { Page } from 'Component/Page';
import { PlayerVideoSelector } from 'Component/PlayerVideoSelector';
import { Rating } from 'Component/Rating';
import { ThemedAccordion } from 'Component/ThemedAccordion';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedDropdown } from 'Component/ThemedDropdown';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedOverlay } from 'Component/ThemedOverlay';
import { ThemedText } from 'Component/ThemedText';
import { useServiceContext } from 'Context/ServiceContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import {
  Bookmark,
  BookmarkCheck,
  Clapperboard,
  Clock,
  Download,
  MessageSquareText,
  Play,
  ShieldOff,
  Star,
} from 'lucide-react-native';
import { useState } from 'react';
import { Dimensions, useWindowDimensions, View } from 'react-native';
import {
  DefaultFocus,
  SpatialNavigationScrollView,
  SpatialNavigationView,
} from 'react-tv-space-navigation';
import NotificationStore from 'Store/Notification.store';
import { useAppTheme } from 'Theme/context';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { FilmInterface } from 'Type/Film.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { isBookmarked } from 'Util/Film';
import { noopFn } from 'Util/Function';

import { componentStyles } from './FilmScreen.style.atv';
import { FilmScreenThumbnail } from './FilmScreen.thumbnail.atv';
import { FilmScreenComponentProps } from './FilmScreen.type';
import {
  ActorView,
  FranchiseItemComponent,
  InfoList,
  RelatedItem,
  ScheduleItem,
  ScheduleOverlay,
  Section,
} from './FilmScreenElements.atv';

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
  playFilm,
  handleVideoSelect,
  handleSelectFilm,
  handleSelectActor,
  handleSelectCategory,
  openBookmarks,
  handleUpdateScheduleWatch,
  handleBookmarkChange,
  openVideoDownloader,
  handleDownloadSelect,
  openTrailerOverlay,
  openRatingOverlay,
  handleRatingSelect,
}: FilmScreenComponentProps) {
  const { scale, theme } = useAppTheme();
  const { isSignedIn } = useServiceContext();
  const styles = useThemedStyles(componentStyles);
  const { height } = useWindowDimensions();
  const [showReadMore, setShowReadMore] = useState<boolean | null>(null);

  if (!film) {
    film = null as unknown as FilmInterface; // dirty hack to avoid null checks
  }

  const shouldShowReadMore = (content: number) => {
    const percent = ((content - scale(40)) / height) * 100;

    setShowReadMore(percent > 44);
  };

  const renderAction = (
    IconComponent: React.ComponentType<any>,
    text: string,
    onPress?: () => void,
    isDisabled?: boolean
  ) => (
    <ThemedButton
      variant="outlined"
      onPress={ isDisabled ? noopFn : onPress }
      IconComponent={ IconComponent }
      iconProps={ { size: scale(18) } }
      style={ [styles.actionButton, isDisabled && styles.actionButtonDisabled] }
      textStyle={ styles.actionButtonText }
      disableRootActive
      disabled={ isDisabled }
    >
      { text }
    </ThemedButton>
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
    <SpatialNavigationView direction="horizontal">
      <DefaultFocus>
        <View style={ styles.actions }>
          { renderPlayButton() }
          { renderAction(MessageSquareText, t('Comments'), () => commentsOverlayRef?.current?.open()) }
          { renderAction(Clapperboard, t('Trailer'), openTrailerOverlay) }
          { renderAction(isBookmarked(film) ? BookmarkCheck : Bookmark, t('Bookmark'), openBookmarks) }
          { renderAction(Download, t('Download'), openVideoDownloader) }
          { isSignedIn && renderAction(Star, t('Rate'), openRatingOverlay, film.isRatingPosted) }
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
      <Section title={ t('Actors') } styles={ styles }>
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
                  styles={ styles }
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
      styles={ styles }
    />
  );

  const renderSchedule = () => {
    const { schedule = [] } = film;

    if (!schedule.length) {
      return null;
    }

    return (
      <Section title={ t('Schedule') } styles={ styles }>
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
                    styles={ styles }
                  />
                )) }
              </View>
            </DefaultFocus>
          </SpatialNavigationScrollView>
        </View>
        <View style={ { width: '100%' } }>
          <ThemedButton
            onPress={ () => scheduleOverlayRef?.current?.open() }
            style={ styles.scheduleViewAll }
          >
            { t('View full schedule') }
          </ThemedButton>
        </View>
      </Section>
    );
  };

  const renderFranchise = () => {
    const { franchise = [] } = film;

    if (!franchise.length) {
      return null;
    }

    return (
      <Section title={ t('Franchise') } styles={ styles }>
        <View style={ styles.franchiseList }>
          { franchise.map((item, idx) => (
            <FranchiseItemComponent
              key={ `franchise-${item.link}` }
              film={ film }
              item={ item }
              idx={ idx }
              handleSelectFilm={ handleSelectFilm }
              styles={ styles }
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
      <Section title={ t('Included in') } styles={ styles }>
        <ThemedAccordion
          data={ data }
          overlayContent={ styles.infoListAccordionOverlay }
          renderItem={ (subItem) => (
            <InfoList
              key={ `info-list-${subItem.name}` }
              list={ subItem }
              handleSelectCategory={ handleSelectCategory }
              styles={ styles }
            />
          ) }
        />
      </Section>
    );
  };

  const renderRelated = () => {
    const { related = [] } = film;

    return (
      <Section title={ t('Related') } styles={ styles }>
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
                  styles={ styles }
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

  const renderContent = () => {
    if (!film) {
      return <FilmScreenThumbnail styles={ styles } />;
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
    <Page style={ styles.page }>
      { renderContent() }
    </Page>
  );
}

export default FilmScreenComponent;
