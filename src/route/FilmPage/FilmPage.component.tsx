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
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import { useRouter } from 'expo-router';
import __ from 'i18n/__';
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
import OverlayStore from 'Store/Overlay.store';
import Colors from 'Style/Colors';
import { CollectionItemInterface } from 'Type/CollectionItem';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';
import { isCloseToBottom } from 'Util/Scroll';

import { SCROLL_EVENT_END_PADDING } from './FilmPage.config';
import { styles } from './FilmPage.style';
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
}: FilmPageComponentProps) {
  const router = useRouter();
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
    }, [commentsVisible],
  );

  if (!film) {
    return (
      <Page>
        <View style={ styles.topActions }>
          <TouchableOpacity
            style={ styles.topActionsButton }
            onPress={ () => router.back() }
          >
            <ThemedIcon
              icon={ {
                name: 'arrow-back',
                pack: IconPackType.MaterialIcons,
              } }
              size={ scale(32) }
              color="white"
            />
          </TouchableOpacity>
          <Thumbnail
            style={ styles.topActionsButton }
            height={ scale(32) }
            width={ scale(32) }
          />
        </View>
        <Thumbnail
          height={ scale(24) }
          width="100%"
        />
        <Thumbnail
          style={ { marginTop: scale(8) } }
          height={ scale(24) }
          width="50%"
        />
        <View style={ styles.genres }>
          { Array(5).fill(0).map((_, i) => (
            <Thumbnail
            // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-thumb` }
              height={ scale(24) }
              width={ scale(64) }
            />
          )) }
        </View>
        <View style={ styles.mainContent }>
          <Thumbnail
            style={ styles.posterWrapper }
          />
          <View style={ [styles.mainInfo, { width: '55%' }] }>
            { Array(5).fill(0).map((_, i) => (
              <Thumbnail
                // eslint-disable-next-line react/no-array-index-key
                key={ `${i}-thumb` }
                style={ styles.textContainer }
                height={ scale(16) }
                width="100%"
              />
            )) }
          </View>
        </View>
        { /* <View style={ styles.quickInfo }>
          { Array(4).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-quick` }
              height={ scale(48) }
              width="20%"
            />
          )) }
        </View> */ }
        <Thumbnail
          style={ styles.description }
          height="20%"
          width="100%"
        />
        <View style={ styles.actions }>
          { Array(3).fill(0).map((_, i) => (
            <Thumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${i}-action` }
              height={ scale(48) }
              width="30%"
            />
          )) }
        </View>
        <Thumbnail
          style={ styles.playBtn }
          height={ scale(48) }
          width="100%"
        />
      </Page>
    );
  }

  const renderTopActions = () => (
    <View style={ styles.topActions }>
      <TouchableOpacity
        style={ styles.topActionsButton }
        onPress={ () => router.back() }
      >
        <ThemedIcon
          icon={ {
            name: 'arrow-back',
            pack: IconPackType.MaterialIcons,
          } }
          size={ scale(32) }
          color="white"
        />
      </TouchableOpacity>
      <TouchableOpacity style={ styles.topActionsButton }>
        <ThemedIcon
          icon={ {
            name: 'share',
            pack: IconPackType.MaterialIcons,
          } }
          size={ scale(32) }
          color="white"
        />
      </TouchableOpacity>
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
    handler?: (link: string) => void,
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

    return renderCollection(items, __('Director'), handleSelectActor);
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
        { renderInfoText(releaseDate, __('Release date')) }
        { renderInfoText(duration, __('Time')) }
        { renderRating() }
        { renderDirectors() }
        { renderCollection(countries, __('Country'), handleSelectCategory) }
      </View>
    );
  };

  const renderMainContent = () => (
    <View style={ styles.mainContent }>
      { renderPoster() }
      { renderMainInfo() }
    </View>
  );

  // const renderQuickInfoText = (title: string, text: string) => (
  //   <View style={ styles.quickInfoTextWrapper }>
  //     <ThemedText style={ styles.quickInfoUpperText }>{ title }</ThemedText>
  //     <ThemedText style={ styles.quickInfoLowerText }>{ text }</ThemedText>
  //   </View>
  // );

  // const renderQuickInfo = () => {
  //   const {
  //     genres = [],
  //     countries = [],
  //     duration,
  //     ratings = [],
  //   } = film;

  //   return (
  //     <View style={ styles.quickInfo }>
  //       { genres.length > 0 && renderQuickInfoText('Жанр', genres[0]) }
  //       { countries.length > 0 && renderQuickInfoText('Страна', countries[0]) }
  //       eslint-disable-next-line max-len
  //       { ratings.length > 0 && renderQuickInfoText('Рейтинг', `${ratings[0].rating} (${ratings[0].votes})`) }
  //       { duration && renderQuickInfoText('Длина', duration) }
  //     </View>
  //   );
  // };

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
            { __('We are waiting for the film in the good quality') }
          </ThemedText>
        </View>
      );
    }

    return (
      <ThemedButton
        style={ styles.playBtn }
        onPress={ playFilm }
      >
        { __('Watch Now') }
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
      { renderAction(__('Trailer'), 'movie-open-check-outline') }
      { renderAction(__('Bookmark'), 'movie-star-outline', () => OverlayStore.openOverlay(bookmarksOverlayId)) }
      { renderAction(__('Download'), 'folder-download-outline') }
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
      <Section title={ __('Actors') }>
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
        onHide={ () => OverlayStore.goToPreviousOverlay() }
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
      <Section title={ __('Schedule') }>
        <View style={ styles.visibleScheduleItems }>
          { visibleScheduleItems.map((item: ScheduleItemInterface, idx: number) => (
            <ScheduleItem
              key={ `visible-${item.name}` }
              item={ item }
              idx={ idx }
            />
          )) }
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
      <Section title={ __('Related') }>
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
      <ScrollView
        horizontal
        contentContainerStyle={ { width: '100%', height: '100%' } }
      >
        <Section title={ __('Comments') }>
          <Comments
            ref={ commentsRef }
            film={ film }
          />
        </Section>
      </ScrollView>
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
        { /* { renderQuickInfo() } */ }
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
