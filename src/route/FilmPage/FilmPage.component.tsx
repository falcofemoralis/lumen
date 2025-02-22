import { Rating } from '@kolking/react-native-rating';
import Comments from 'Component/Comments';
import { CommentsRef } from 'Component/Comments/Comments.container';
import FilmCard from 'Component/FilmCard';
import Page from 'Component/Page';
import PlayerVideoSelector from 'Component/PlayerVideoSelector';
import ThemedAccordion from 'Component/ThemedAccordion';
import ThemedButton from 'Component/ThemedButton';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedImageModal from 'Component/ThemedImageModal';
import ThemedText from 'Component/ThemedText';
import Thumbnail from 'Component/Thumbnail';
import { useRouter } from 'expo-router';
import __ from 'i18n/__';
import React, { useCallback, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from 'Style/Colors';
import { ActorInterface } from 'Type/Actor.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FranchiseItem } from 'Type/FranchiseItem.interface';
import { InfoListInterface } from 'Type/InfoList.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';
import { isCloseToBottom } from 'Util/Scroll';

import { PLAYER_VIDEO_SELECTOR_OVERLAY_ID, SCROLL_EVENT_END_PADDING } from './FilmPage.config';
import { styles } from './FilmPage.style';
import { FilmPageComponentProps } from './FilmPage.type';

export function FilmPageComponent({
  film,
  playFilm,
  hideVideoSelector,
  handleVideoSelect,
  handleSelectFilm,
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
          { genres.map((genre) => (
            <ThemedText
              key={ genre }
              style={ styles.genre }
            >
              { genre }
            </ThemedText>
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

  const renderCollectionInfo = (collection: string[], title?: string) => {
    if (!collection.length) {
      return null;
    }

    return (
      <View style={ styles.collectionContainer }>
        { title && (
          <ThemedText style={ styles.collectionTitle }>
            { `${title}: ` }
          </ThemedText>
        ) }
        { collection.map((item) => (
          <TouchableOpacity
            key={ item }
            style={ styles.collectionButton }
          >
            <ThemedText
              style={ styles.collectionButtonText }
            >
              { item }
            </ThemedText>
          </TouchableOpacity>
        )) }
      </View>
    );
  };

  const renderMainInfo = () => {
    const {
      releaseDate,
      ratings = [],
      directors = [],
      countries = [],
      duration,
    } = film;

    return (
      <View style={ styles.mainInfo }>
        { ratings.map(({ name, rating, votes }) => renderInfoText(`${rating} (${votes})`, name)) }
        { renderInfoText(releaseDate, 'Дата выхода') }
        { renderInfoText(duration, 'Время') }
        { renderRating() }
        { renderCollectionInfo(directors.map(({ name }) => name), 'Режиссер') }
        { renderCollectionInfo(countries, 'Страна') }
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
            size={ 32 }
            color="white"
          />
          <ThemedText style={ styles.pendingReleaseText }>
            { __('Ожидаем фильм в хорошем качестве...') }
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
      { renderAction(__('Bookmark'), 'movie-star-outline') }
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

  const renderActor = (actor: ActorInterface) => {
    const {
      name,
      photo,
      job,
      isDirector,
    } = actor;

    return (
      <View
        key={ name }
        style={ styles.actor }
      >
        <View>
          <ThemedImage
            style={ styles.actorPhoto }
            src={ photo }
          />
          { isDirector && (
            <View style={ styles.director }>
              <ThemedIcon
                icon={ {
                  pack: IconPackType.MaterialIcons,
                  name: 'stars',
                } }
                size={ scale(12) }
                color="yellow"
              />
              <ThemedText style={ styles.directorText }>
                { __('Director') }
              </ThemedText>
            </View>
          ) }
        </View>
        <ThemedText
          style={ styles.actorName }
        >
          { name }
        </ThemedText>
        { job && (
          <ThemedText
            style={ styles.actorJob }
          >
            { job }
          </ThemedText>
        ) }
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
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Actors') }
        </ThemedText>
        <ScrollView horizontal>
          <View style={ styles.actorsList }>
            { persons.map((actor) => renderActor(actor)) }
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderScheduleItem = (item: ScheduleItemInterface, idx: number) => {
    const {
      name,
      episodeName,
      episodeNameOriginal,
      date,
      releaseDate,
      isWatched,
      isReleased,
    } = item;

    return (
      <View
        key={ name }
        style={ [
          styles.scheduleItem,
          idx % 2 === 0 && styles.scheduleItemEven,
        ] }
      >
        <View style={ styles.scheduleItemInfoWrapper }>
          <View style={ styles.scheduleItemEpisodeWrapper }>
            <ThemedText style={ [
              styles.scheduleItemText,
              styles.scheduleItemEpisodeName,
            ] }
            >
              { episodeName }
            </ThemedText>
            <ThemedText style={ [
              styles.scheduleItemText,
              styles.scheduleItemEpisodeOgName,
            ] }
            >
              { episodeNameOriginal }
            </ThemedText>
          </View>
          <View style={ styles.scheduleItemNameWrapper }>
            <ThemedText style={ styles.scheduleItemText }>
              { name }
            </ThemedText>
            <ThemedText style={ styles.scheduleItemText }>
              { date }
            </ThemedText>
          </View>
        </View>
        <View style={ styles.scheduleItemReleaseWrapper }>
          { isReleased ? (
            <TouchableOpacity
              onPress={ () => console.log('watch') }
            >
              <ThemedIcon
                style={ styles.scheduleItemMarkIcon }
                icon={ {
                  name: 'checkbox-marked-circle-outline',
                  pack: IconPackType.MaterialCommunityIcons,
                } }
                size={ scale(32) }
                color={ isWatched ? Colors.secondary : Colors.white }
              />
            </TouchableOpacity>
          ) : (
            <ThemedText
              style={ [
                styles.scheduleItemText,
                styles.scheduleItemReleaseDate,
              ] }
            >
              { releaseDate }
            </ThemedText>
          ) }
        </View>
      </View>
    );
  };

  const renderSchedule = () => {
    const { schedule = [] } = film;

    if (!schedule.length) {
      return null;
    }

    const data = schedule.map((item) => ({
      id: item.name,
      title: item.name,
      items: item.items,
    }));

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Schedule') }
        </ThemedText>
        <ThemedAccordion
          data={ data }
          renderItem={ renderScheduleItem }
        />
      </View>
    );
  };

  const renderFranchiseItem = (item: FranchiseItem, idx: number) => {
    const { franchise = [] } = film;
    const {
      name,
      year,
      rating,
      link,
    } = item;
    const position = Math.abs(idx - franchise.length);

    return (
      <TouchableOpacity
        key={ item.name }
        onPress={ () => handleSelectFilm(link) }
      >
        <View style={ styles.franchiseItem }>
          <ThemedText style={ styles.franchiseText }>
            { position }
          </ThemedText>
          <ThemedText
            style={ [
              styles.franchiseText,
              styles.franchiseName,
              !link && styles.franchiseSelected,
            ] }
          >
            { name }
          </ThemedText>
          <ThemedText style={ styles.franchiseText }>
            { year }
          </ThemedText>
          <ThemedText style={ styles.franchiseText }>
            { rating }
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFranchise = () => {
    const { franchise = [] } = film;

    if (!franchise.length) {
      return null;
    }

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Franchise') }
        </ThemedText>
        <View style={ styles.franchiseList }>
          { franchise.map((item, idx) => renderFranchiseItem(item, idx)) }
        </View>
      </View>
    );
  };

  const renderRelatedItem = (item: FilmCardInterface, idx: number) => (
    <Pressable
      // eslint-disable-next-line react/no-array-index-key -- idx is unique
      key={ `${film.id}-${idx}` }
      style={ { width: scale(100) } }
      onPress={ () => handleSelectFilm(item.link) }
    >
      <FilmCard
        filmCard={ item }
        // isThumbnail={ film.isThumbnail }
      />
    </Pressable>
  );

  const renderRelated = () => {
    const { related = [] } = film;

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Watch also') }
        </ThemedText>
        <ScrollView horizontal>
          <View style={ styles.relatedList }>
            { related.map((item, idx) => renderRelatedItem(item, idx)) }
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderInfoList = (list: InfoListInterface, idx: number) => {
    const { name, position, link } = list;

    return (
      <TouchableOpacity
        key={ name }
        onPress={ () => console.log('info-list', link) }
      >
        <View style={ [
          styles.infoList,
          idx % 2 === 0 && styles.infoListEven,
        ] }
        >
          <ThemedText style={ styles.infoListName }>
            { `${name} ${position || ''}` }
          </ThemedText>
        </View>
      </TouchableOpacity>
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
        title: 'Included in the lists',
        items: includedIn,
      });
    }

    if (fromCollections.length) {
      data.push({
        id: 'from-collections',
        title: 'From collections',
        items: fromCollections,
      });
    }

    return (
      <View style={ styles.section }>
        <ThemedText style={ styles.sectionHeading }>
          { __('Included in') }
        </ThemedText>
        <ThemedAccordion
          data={ data }
          renderItem={ renderInfoList }
        />
      </View>
    );
  };

  const renderPlayerVideoSelector = () => {
    const { voices = [], hasVoices, hasSeasons } = film;

    if (!voices.length || (!hasVoices && !hasSeasons)) {
      return null;
    }

    return (
      <PlayerVideoSelector
        overlayId={ PLAYER_VIDEO_SELECTOR_OVERLAY_ID }
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
        <View style={ styles.section }>
          <ThemedText style={ styles.sectionHeading }>
            { __('Comments') }
          </ThemedText>
          <Comments
            ref={ commentsRef }
            film={ film }
          />
        </View>
      </ScrollView>
    );
  };

  const renderModals = () => (
    <>
      { renderPlayerVideoSelector() }
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
        {
        /**
         * It is useless to display this data since it is already displayed in the main content
         */
        }
        { /* { renderQuickInfo() } */ }
        { renderDescription() }
        { renderActions() }
        { renderPlayFilmButton() }
        { renderActors() }
        { renderSchedule() }
        { renderFranchise() }
        { renderInfoLists() }
        { renderRelated() }
        { renderComments() }
      </ScrollView>
    </Page>
  );
}

export default FilmPageComponent;
