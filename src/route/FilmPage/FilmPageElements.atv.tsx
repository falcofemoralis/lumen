import FilmCard from 'Component/FilmCard';
import Loader from 'Component/Loader';
import ThemedCard from 'Component/ThemedCard';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import { useOverlayContext } from 'Context/OverlayContext';
import t from 'i18n/t';
import { CircleCheck, Star } from 'lucide-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { Colors } from 'Style/Colors';
import { ActorCardInterface } from 'Type/ActorCard.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FranchiseItem } from 'Type/FranchiseItem.interface';
import { InfoListInterface } from 'Type/InfoList.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmPage.style.atv';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section = ({
  title,
  children,
}: SectionProps) => (
  <ThemedCard style={ styles.section }>
    <ThemedText style={ styles.sectionHeading }>
      { title }
    </ThemedText>
    <View style={ styles.sectionContent }>
      { children }
    </View>
  </ThemedCard>
);

interface ActorProps {
  actor: ActorCardInterface
  handleSelectActor: (link: string) => void
}

export const ActorView = memo(({
  actor,
  handleSelectActor,
}: ActorProps) => {
  const {
    name,
    photo,
    job,
    isDirector,
    link,
  } = actor;

  return (
    <SpatialNavigationFocusableView
      onSelect={ () => handleSelectActor(link ?? '') }
    >
      { ({ isFocused }) => (
        <View style={ [styles.actor, isFocused && styles.actorFocused] }>
          <View>
            <ThemedImage
              style={ styles.actorPhoto }
              src={ photo }
            />
            { isDirector && (
              <View style={ styles.director }>
                <Star
                  size={ scale(12) }
                  color="yellow"
                />
                <ThemedText style={ styles.directorText }>
                  { t('Director') }
                </ThemedText>
              </View>
            ) }
          </View>
          <ThemedText
            style={ [
              styles.actorName,
              isFocused && styles.actorNameFocused,
            ] }
          >
            { name }
          </ThemedText>
          { job && (
            <ThemedText
              style={ [
                styles.actorJob,
                isFocused && styles.actorNameFocused,
              ] }
            >
              { job }
            </ThemedText>
          ) }
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );
}, (
  prevProps: ActorProps, nextProps: ActorProps
) => prevProps.actor.name === nextProps.actor.name);

interface ScheduleItemProps {
  item: ScheduleItemInterface,
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>
}

export const ScheduleItem = memo(({
  item,
  handleUpdateScheduleWatch,
}: ScheduleItemProps) => {
  const {
    name,
    episodeName,
    episodeNameOriginal,
    date,
    releaseDate,
    isWatched,
    isReleased,
  } = item;
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(isWatched);

  useEffect(() => {
    setIsChecked(isWatched);
  }, [isWatched]);

  const handlePress = useCallback(async () => {
    setIsLoading(true);

    const result = await handleUpdateScheduleWatch(item);

    setIsLoading(false);

    if (!result) {
      return;
    }

    setIsChecked((prev) => !prev);
  }, [handleUpdateScheduleWatch, item]);

  return (
    <SpatialNavigationFocusableView
      onSelect={ handlePress }
    >
      { ({ isFocused }) => (
        <View
          style={ [
            styles.scheduleItem,
            isFocused && styles.scheduleItemFocused,
          ] }
        >
          <View style={ styles.scheduleItemInfoWrapper }>
            <View style={ styles.scheduleItemEpisodeWrapper }>
              <ThemedText style={ [
                styles.scheduleItemText,
                styles.scheduleItemEpisodeName,
                isFocused && styles.scheduleItemTextFocused,
              ] }
              >
                { episodeName }
              </ThemedText>
              <ThemedText style={ [
                styles.scheduleItemText,
                styles.scheduleItemEpisodeOgName,
                isFocused && styles.scheduleItemTextFocused,
              ] }
              >
                { episodeNameOriginal }
              </ThemedText>
            </View>
            <View style={ styles.scheduleItemNameWrapper }>
              <ThemedText style={ [
                styles.scheduleItemText,
                isFocused && styles.scheduleItemTextFocused,
              ] }
              >
                { name }
              </ThemedText>
              <ThemedText style={ [
                styles.scheduleItemText,
                isFocused && styles.scheduleItemTextFocused,
              ] }
              >
                { date }
              </ThemedText>
            </View>
          </View>
          <View style={ styles.scheduleItemReleaseWrapper }>
            { isReleased ? (
              <View
                style={ styles.scheduleItemMarkIcon }
              >
                { isLoading ? (
                  <Loader isLoading />
                ) : (
                  <CircleCheck
                    size={ scale(24) }
                    color={ isChecked
                      ? Colors.secondary
                      : isFocused
                        ? Colors.black
                        : Colors.white }
                  />
                ) }
              </View>
            ) : (
              <ThemedText
                style={ [
                  styles.scheduleItemText,
                  styles.scheduleItemReleaseDate,
                  isFocused && styles.scheduleItemTextFocused,
                ] }
              >
                { releaseDate }
              </ThemedText>
            ) }
          </View>
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );
}, (
  prevProps: ScheduleItemProps, nextProps: ScheduleItemProps
) => prevProps.item.name === nextProps.item.name);

interface FranchiseItemProps {
  film: FilmInterface,
  item: FranchiseItem,
  idx: number,
  handleSelectFilm: (film: FilmInterface) => void
}

export const FranchiseItemComponent = memo(({
  film,
  item,
  idx,
  handleSelectFilm,
}: FranchiseItemProps) => {
  const { franchise = [] } = film;
  const {
    name,
    year,
    rating,
    link,
  } = item;
  const position = Math.abs(idx - franchise.length);

  const onSelect = useCallback(() => {
    if (link) {
      handleSelectFilm({ link } as unknown as FilmInterface);
    }
  }, [link, handleSelectFilm]);

  return (
    <SpatialNavigationFocusableView
      onSelect={ onSelect }
    >
      { ({ isFocused }) => (
        <View style={ [styles.franchiseItem, isFocused && styles.franchiseItemFocused] }>
          <ThemedText
            style={ [
              styles.franchiseText,
              !link && styles.franchiseSelected,
              isFocused && styles.franchiseTextFocused,
            ] }
          >
            { position }
          </ThemedText>
          <ThemedText
            style={ [
              styles.franchiseText,
              styles.franchiseName,
              !link && styles.franchiseSelected,
              isFocused && styles.franchiseTextFocused,
            ] }
          >
            { name }
          </ThemedText>
          <ThemedText
            style={ [
              styles.franchiseText,
              isFocused && styles.franchiseTextFocused,
            ] }
          >
            { year }
          </ThemedText>
          <ThemedText
            style={ [
              styles.franchiseText,
              isFocused && styles.franchiseTextFocused,
            ] }
          >
            { rating }
          </ThemedText>
        </View>
      ) }

    </SpatialNavigationFocusableView>
  );
}, (
  prevProps: FranchiseItemProps, nextProps: FranchiseItemProps
) => prevProps.item.link === nextProps.item.link);

interface InfoListProps {
  list: InfoListInterface,
  handleSelectCategory: (link: string) => void
}

export const InfoList = memo(({
  list,
  handleSelectCategory,
}: InfoListProps) => {
  const { goToPreviousOverlay } = useOverlayContext();
  const { name, position, link } = list;

  return (
    <SpatialNavigationFocusableView
      onSelect={ () => {
        handleSelectCategory(link);
        goToPreviousOverlay();
      } }
    >
      { ({ isFocused }) => (
        <View
          style={ [
            styles.infoList,
            isFocused && styles.infoListFocused,
          ] }
        >
          <ThemedText
            style={ [
              styles.infoListName,
              isFocused && styles.infoListNameFocused,
            ] }
          >
            { `${name} ${position || ''}` }
          </ThemedText>
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );
}, (
  prevProps: InfoListProps, nextProps: InfoListProps
) => prevProps.list.link === nextProps.list.link);

interface RelatedItemProps {
  film: FilmInterface,
  item: FilmCardInterface,
  handleSelectFilm: (film: FilmInterface) => void
}

export const RelatedItem = memo(({
  film,
  item,
  handleSelectFilm,
}: RelatedItemProps) => (
  <SpatialNavigationFocusableView
    onSelect={ () => handleSelectFilm(film) }
  >
    { ({ isFocused }) => (
      <FilmCard
        filmCard={ item }
        isFocused={ isFocused }
        style={ styles.relatedListItem }
        stylePoster={ styles.relatedListItemPoster }
      />
    ) }
  </SpatialNavigationFocusableView>
), (
  prevProps: RelatedItemProps, nextProps: RelatedItemProps
) => prevProps.item.id === nextProps.item.id);
