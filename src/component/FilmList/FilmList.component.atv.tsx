import { FilmRating } from 'Component/FilmRating';
import { InfoBlock } from 'Component/InfoBlock';
import { LoginForm } from 'Component/LoginForm';
import { ThemedButton } from 'Component/ThemedButton';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import EllipsisVertical from 'lucide-react-native/icons/ellipsis-vertical';
import Play from 'lucide-react-native/icons/play';
import Trash2 from 'lucide-react-native/icons/trash-2';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import { useCallback, useRef } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { NUMBER_OF_COLUMNS_TV } from 'Screen/RecentScreen/RecentScreen.config';
import { componentStyles } from 'Screen/RecentScreen/RecentScreen.style.atv';

import { FilmListContainerProps, FilmListItem } from './FilmList.type';

const NAME_MAX_LINES = 2;
const INFO_MAX_LINES = 2;
const ACTION_ICON_SIZE = 20;

function FilmListRow({
  item,
  styles,
  compactActions,
  isLastRow,
  onFilmPress,
  onContinueWatching,
  onRemove,
  onToggleWatched,
}: {
  item: FilmListItem;
  styles: ThemedStyles<typeof componentStyles>;
  compactActions: boolean;
  isLastRow: boolean;
  onFilmPress: (film: FilmListItem['film']) => void;
  onContinueWatching?: (item: FilmListItem) => void;
  onRemove?: (item: FilmListItem) => void;
  onToggleWatched?: (item: FilmListItem) => void;
}) {
  const { ref, focusKey, hasFocusedChild } = useFocusable<object, View>({
    trackChildren: true,
    saveLastFocusedChild: false,
  });
  const { scale } = useAppTheme();
  const { film } = item;

  const renderActions = () => {
    if (!onContinueWatching && !onRemove && !onToggleWatched) {
      return null;
    }

    if (compactActions) {
      return (
        <>
          { onContinueWatching && (
            <ThemedButton
              style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
              contentStyle={ styles.actionButtonContent }
              IconComponent={ Play }
              onPress={ () => onContinueWatching(item) }
              iconProps={ { size: scale(ACTION_ICON_SIZE) } }
            />
          ) }
          { (onRemove || onToggleWatched) && (
            <ThemedButton
              style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
              contentStyle={ styles.actionButtonContent }
              IconComponent={ EllipsisVertical }
              onPress={ () => {
                onRemove?.(item);
              } }
              iconProps={ { size: scale(ACTION_ICON_SIZE) } }
            />
          ) }
        </>
      );
    }

    return (
      <>
        { onContinueWatching && (
          <ThemedButton
            style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
            contentStyle={ styles.actionButtonContent }
            IconComponent={ Play }
            onPress={ () => onContinueWatching(item) }
            iconProps={ { size: scale(ACTION_ICON_SIZE) } }
          />
        ) }
        { onRemove && (
          <ThemedButton
            style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
            contentStyle={ styles.actionButtonContent }
            IconComponent={ Trash2 }
            onPress={ () => onRemove(item) }
            iconProps={ { size: scale(ACTION_ICON_SIZE) } }
          />
        ) }
        { onToggleWatched && (
          <ThemedButton
            style={ [styles.actionButton, hasFocusedChild && styles.actionButtonUnzoomed] }
            contentStyle={ styles.actionButtonContent }
            IconComponent={ item.isWatched ? EyeOff : Eye }
            onPress={ () => onToggleWatched(item) }
            iconProps={ { size: scale(ACTION_ICON_SIZE) } }
          />
        ) }
      </>
    );
  };

  return (
    <Animated.View
      ref={ ref }
      style={ [styles.row, isLastRow && styles.lastRow, hasFocusedChild && styles.rowFocused] }
      tvFocusable={ false}
    >
      <ThemedPressable
        style={ styles.fill }
        contentStyle={ styles.fill }
        onPress={ () => onFilmPress(film) }
      >
        { ({ isFocused }) => (
          <Animated.View
            style={ [
              styles.fill,
              styles.item,
              isFocused && styles.itemFocused,
              item.isWatched && styles.itemHidden,
            ] }
          >
            <View style={ [styles.poster, styles.posterContainer, isFocused && styles.posterContainerFocused] }>
              <ThemedImage
                style={ styles.poster }
                src={ film.poster }
                cachePolicy="memory-disk"
                transition={ 0 }
              />
              <FilmRating filmId={ film.id } ratings={ film.ratings }
              ratingSourceType={ film.ratingSourceType } ratingFilmId={ film.ratingFilmId } />
            </View>

            <View style={ styles.itemContent }>
              <ThemedText
                style={ [styles.name, isFocused && styles.nameFocused] }
                numberOfLines={ NAME_MAX_LINES }
              >
                { film.title }
              </ThemedText>

              { film.subtitle && (
                <ThemedText
                  style={ [styles.date, isFocused && styles.dateFocused] }
                  numberOfLines={ 1 }
                >
                  { film.subtitle }
                </ThemedText>
              ) }

              { film.info && (
                <ThemedText
                  style={ [styles.info, isFocused && styles.infoFocused] }
                  numberOfLines={ INFO_MAX_LINES }
                >
                  { film.info }
                </ThemedText>
              ) }

              { item.additionalInfo && (
                <ThemedText
                  style={ [styles.additionalInfo, isFocused && styles.additionalInfoFocused] }
                  numberOfLines={ INFO_MAX_LINES }
                >
                  { item.additionalInfo }
                </ThemedText>
              ) }
            </View>
          </Animated.View>
        ) }
      </ThemedPressable>

      { renderActions() }
    </Animated.View>
  );
}

export function FilmListComponentTV({
  items,
  onFilmPress,
  onNextLoad,
  onContinueWatching,
  onRemove,
  onToggleWatched,
}: FilmListContainerProps & { onFilmPress: NonNullable<FilmListContainerProps['onFilmPress']> }) {
  const styles = useThemedStyles(componentStyles);
  const { scale } = useAppTheme();

  const numberOfColumns = NUMBER_OF_COLUMNS_TV;

  const lastRowStart = Math.floor(
    Math.max(items.length - 1, 0) / numberOfColumns,
  ) * numberOfColumns;

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<FilmListItem>) => (
      <FilmListRow
        item={ item }
        styles={ styles }
        compactActions={ false }
        isLastRow={ index >= lastRowStart }
        onFilmPress={ onFilmPress }
        onContinueWatching={ onContinueWatching }
        onRemove={ onRemove }
        onToggleWatched={ onToggleWatched }
      />
    ),
    [
      lastRowStart,
      onContinueWatching,
      onFilmPress,
      onRemove,
      onToggleWatched,
      styles,
    ],
  );

  return (
    <ThemedGrid
      key={ numberOfColumns }
      autofocus
      style={ [styles.grid, { paddingHorizontal: 30 }] }
      rowStyle={ styles.rowStyle }
      data={ items }
      numberOfColumns={ numberOfColumns }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      scrollBehavior='stick-to-center'
    />
  );
}
export default FilmListComponentTV;
