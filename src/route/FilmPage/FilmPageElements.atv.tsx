import FilmCard from 'Component/FilmCard';
import ThemedCard from 'Component/ThemedCard';
import ThemedIcon from 'Component/ThemedIcon';
import { IconPackType } from 'Component/ThemedIcon/ThemedIcon.type';
import ThemedImage from 'Component/ThemedImage';
import ThemedText from 'Component/ThemedText';
import __ from 'i18n/__';
import { memo } from 'react';
import { View } from 'react-native';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
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
  prevProps: ActorProps, nextProps: ActorProps,
) => prevProps.actor.name === nextProps.actor.name);

interface ScheduleItemProps {
  item: ScheduleItemInterface,
  idx: number
}

export const ScheduleItem = memo(({
  item,
  idx,
}: ScheduleItemProps) => {
  const {
    name,
    episodeName,
    episodeNameOriginal,
    date,
    releaseDate,
    isReleased,
  } = item;

  return (
    <SpatialNavigationFocusableView>
      { ({ isFocused }) => (
        <View
          style={ [
            styles.scheduleItem,
            idx % 2 === 0 && styles.scheduleItemEven,
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
            <ThemedText style={ [
              styles.scheduleItemText,
              styles.scheduleItemReleaseDate,
              isFocused && styles.scheduleItemTextFocused,
            ] }
            >
              { !isReleased ? releaseDate : '' }
            </ThemedText>
          </View>
        </View>
      ) }
    </SpatialNavigationFocusableView>
  );
}, (
  prevProps: ScheduleItemProps, nextProps: ScheduleItemProps,
) => prevProps.item.name === nextProps.item.name);

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
    <SpatialNavigationFocusableView
      onSelect={ () => {
        if (link) {
          handleSelectFilm(link);
        }
      } }
    >
      { ({ isFocused }) => (
        <View style={ [styles.franchiseItem, isFocused && styles.franchiseItemFocused] }>
          <ThemedText
            style={ [
              styles.franchiseText,
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
  prevProps: FranchiseItemProps, nextProps: FranchiseItemProps,
) => prevProps.item.link === nextProps.item.link);

interface InfoListProps {
  list: InfoListInterface,
  idx: number,
  handleSelectCategory: (link: string) => void
}

export const InfoList = memo(({
  list,
  idx,
  handleSelectCategory,
}: InfoListProps) => {
  const { name, position, link } = list;

  return (
    <SpatialNavigationFocusableView
      onSelect={ () => handleSelectCategory(link) }
    >
      { ({ isFocused }) => (
        <View style={ [
          styles.infoList,
          idx % 2 === 0 && styles.infoListEven,
          isFocused && styles.infoListFocused,
        ] }
        >
          <ThemedText style={ [
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
  <SpatialNavigationFocusableView
    onSelect={ () => handleSelectFilm(item.link) }
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
  prevProps: RelatedItemProps, nextProps: RelatedItemProps,
) => prevProps.item.id === nextProps.item.id);
