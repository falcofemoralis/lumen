import FilmCard from 'Component/FilmCard';
import Loader from 'Component/Loader';
import ThemedImage from 'Component/ThemedImage';
import ThemedPressable from 'Component/ThemedPressable';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { CircleCheck, Star } from 'lucide-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  View,
} from 'react-native';
import { Colors } from 'Style/Colors';
import { ActorCardInterface } from 'Type/ActorCard.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FranchiseItem } from 'Type/FranchiseItem.interface';
import { InfoListInterface } from 'Type/InfoList.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { scale } from 'Util/CreateStyles';

import { styles } from './FilmPage.style';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  useHeadingWrapper?: boolean;
}

export const Section = ({
  title,
  children,
  useHeadingWrapper,
}: SectionProps) => (
  <View style={ styles.section }>
    <ThemedText style={ [styles.sectionHeading, useHeadingWrapper && styles.sectionHeadingWrapper] }>
      { title }
    </ThemedText>
    <View style={ styles.sectionContent }>
      { children }
    </View>
  </View>
);

interface ActorProps {
  actor: ActorCardInterface,
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
    <Pressable
      style={ styles.actor }
      onPress={ () => handleSelectActor(link ?? '') }
    >
      <View>
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
    </Pressable>
  );
}, (
  prevProps: ActorProps, nextProps: ActorProps
) => prevProps.actor.name === nextProps.actor.name);

interface ScheduleItemProps {
  item: ScheduleItemInterface,
  useInternalState?: boolean,
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>
}

export const ScheduleItem = memo(({
  item,
  useInternalState,
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
    if (!useInternalState) {
      return;
    }

    setIsChecked(isWatched);
  }, [isWatched]);

  const handlePress = useCallback(async () => {
    setIsLoading(true);

    const result = await handleUpdateScheduleWatch(item);

    setIsLoading(false);

    if (!result) {
      return;
    }

    if (useInternalState) {
      setIsChecked((prev) => !prev);
    }
  }, [handleUpdateScheduleWatch, item]);

  return (
    <View style={ styles.scheduleItem }>
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
          <ThemedPressable
            style={ styles.scheduleItemMarkIcon }
            onPress={ handlePress }
          >
            { isLoading ? (
              <Loader isLoading />
            ) : (
              <CircleCheck
                size={ scale(24) }
                color={ (useInternalState ? isChecked : isWatched) ? Colors.secondary : Colors.white }
              />
            ) }
          </ThemedPressable>
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
}, (
  prevProps: ScheduleItemProps, nextProps: ScheduleItemProps
) => prevProps.item.id === nextProps.item.id
  && prevProps.item.isWatched === nextProps.item.isWatched);

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

  const onPress = useCallback(() => {
    if (link) {
      handleSelectFilm({ link } as unknown as FilmInterface);
    }
  }, [link, handleSelectFilm]);

  return (
    <ThemedPressable
      disabled={ !link }
      onPress={ onPress }
      style={ styles.franchiseItemButton }
      contentStyle={ styles.franchiseItemButtonContent }
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
    </ThemedPressable>
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
  const { name, position, link } = list;

  return (
    <ThemedPressable
      onPress={ () => handleSelectCategory(link) }
      style={ styles.infoListItem }
      contentStyle={ styles.infoListItemContent }
    >
      <ThemedText style={ styles.infoListName }>
        { `${name} ${position || ''}` }
      </ThemedText>
    </ThemedPressable>
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
  <Pressable
    style={ { width: scale(100) } }
    onPress={ () => handleSelectFilm(film) }
  >
    <FilmCard
      filmCard={ item }
    />
  </Pressable>
), (
  prevProps: RelatedItemProps, nextProps: RelatedItemProps
) => prevProps.item.id === nextProps.item.id);
