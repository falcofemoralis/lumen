import FilmCard from 'Component/FilmCard';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import t from 'i18n/t';
import { memo, useCallback, useState } from 'react';
import {
  Pressable, TouchableHighlight, TouchableOpacity, View,
} from 'react-native';
import Colors from 'Style/Colors';
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
}

export const Section = ({
  title,
  children,
}: SectionProps) => (
  <View style={ styles.section }>
    <ThemedText style={ styles.sectionHeading }>
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
    <TouchableHighlight
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
              <ThemedIcon
                icon={ {
                  pack: IconPackType.MaterialIcons,
                  name: 'stars',
                } }
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
    </TouchableHighlight>
  );
}, (
  prevProps: ActorProps, nextProps: ActorProps,
) => prevProps.actor.name === nextProps.actor.name);

interface ScheduleItemProps {
  item: ScheduleItemInterface,
  idx: number
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => void
}

export const ScheduleItem = memo(({
  item,
  idx,
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

  const handlePress = useCallback(() => {
    handleUpdateScheduleWatch(item);
  }, [handleUpdateScheduleWatch, item]);

  return (
    <View
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
            onPress={ handlePress }
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
}, (
  prevProps: ScheduleItemProps, nextProps: ScheduleItemProps,
) => prevProps.item.name === nextProps.item.name
  && prevProps.item.isWatched === nextProps.item.isWatched);

interface FranchiseItemProps {
  film: FilmInterface,
  item: FranchiseItem,
  idx: number,
  handleSelectFilm: (link: string) => void
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

  return (
    <TouchableOpacity
      disabled={ !link }
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
}, (
  prevProps: FranchiseItemProps, nextProps: FranchiseItemProps,
) => prevProps.item.link === nextProps.item.link);

interface InfoListProps {
  list: InfoListInterface,
  idx: number
  handleSelectCategory: (link: string) => void
}

export const InfoList = memo(({
  list,
  idx,
  handleSelectCategory,
}: InfoListProps) => {
  const { name, position, link } = list;

  return (
    <TouchableOpacity
      onPress={ () => handleSelectCategory(link) }
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
}, (
  prevProps: InfoListProps, nextProps: InfoListProps,
) => prevProps.list.link === nextProps.list.link);

interface RelatedItemProps {
  item: FilmCardInterface,
  handleSelectFilm: (link: string) => void
}

export const RelatedItem = memo(({
  item,
  handleSelectFilm,
}: RelatedItemProps) => (
  <Pressable
    style={ { width: scale(100) } }
    onPress={ () => handleSelectFilm(item.link) }
  >
    <FilmCard
      filmCard={ item }
    />
  </Pressable>
), (
  prevProps: RelatedItemProps, nextProps: RelatedItemProps,
) => prevProps.item.id === nextProps.item.id);
