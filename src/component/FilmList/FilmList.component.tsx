import { FilmRating } from 'Component/FilmRating';
import { InfoBlock } from 'Component/InfoBlock';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedImage } from 'Component/ThemedImage';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import Play from 'lucide-react-native/icons/play';
import Trash2 from 'lucide-react-native/icons/trash-2';
import Eye from 'lucide-react-native/icons/eye';
import EyeOff from 'lucide-react-native/icons/eye-off';
import { memo, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { FilmListContainerProps, FilmListItem } from './FilmList.type';
import { componentStyles } from './FilmList.style';

const NUMBER_OF_COLUMNS = 1;

function FilmListRow({
  item,
  index,
  styles,
  onFilmPress,
  onContinueWatching,
  onRemove,
  onToggleWatched,
}: {
  item: FilmListItem;
  index: number;
  styles: ThemedStyles<typeof componentStyles>;
  onFilmPress: (film: FilmListItem['film']) => void;
  onContinueWatching?: (item: FilmListItem) => void;
  onRemove?: (item: FilmListItem) => void;
  onToggleWatched?: (item: FilmListItem) => void;
}) {
  const { scale, theme } = useAppTheme();
  const { film } = item;

  return (
    <ThemedPressable
      onPress={ () => onFilmPress(film) }
      contentStyle={ styles.itemContentWrapper }
    >
      <View style={ [
        styles.item,
        index !== 0 && styles.itemBorder,
        item.isWatched && styles.itemHidden,
      ] }
      >
        <View style={ styles.itemContainer }>
          <View style={ { position: 'relative' } }>
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
            <ThemedText style={ styles.name }>
              { film.title }
            </ThemedText>

            { film.subtitle && (
              <ThemedText style={ styles.date }>
                { film.subtitle }
              </ThemedText>
            ) }

            { film.info && (
              <ThemedText style={ styles.info }>
                { film.info }
              </ThemedText>
            ) }

            { item.additionalInfo && (
              <ThemedText style={ styles.additionalInfo }>
                { item.additionalInfo }
              </ThemedText>
            ) }
          </View>

          { (onContinueWatching || onRemove || onToggleWatched) && (
            <View style={ styles.actionsColumn }>
              { onContinueWatching && (
                <ThemedPressable
                  onPress={ () => onContinueWatching(item) }
                  style={ styles.actionButton }
                >
                  <Play
                    size={ scale(24) }
                    color={ theme.colors.icon }
                  />
                </ThemedPressable>
              ) }

              { onRemove && (
                <ThemedPressable
                  onPress={ () => onRemove(item) }
                  style={ styles.actionButton }
                >
                  <Trash2
                    size={ scale(24) }
                    color={ theme.colors.icon }
                  />
                </ThemedPressable>
              ) }

              { onToggleWatched && (
                <ThemedPressable
                  onPress={ () => onToggleWatched(item) }
                  style={ styles.actionButton }
                >
                  { item.isWatched ? (
                    <EyeOff
                      size={ scale(24) }
                      color={ theme.colors.icon }
                    />
                  ) : (
                    <Eye
                      size={ scale(24) }
                      color={ theme.colors.icon }
                    />
                  ) }
                </ThemedPressable>
              ) }
            </View>
          ) }
        </View>
      </View>
    </ThemedPressable>
  );
}

const MemoizedFilmListRow = memo(
  FilmListRow,
  (prev, next) => (
    prev.item.film === next.item.film &&
    prev.item.isWatched === next.item.isWatched &&
    prev.item.additionalInfo === next.item.additionalInfo
  ),
);

export function FilmListComponent({
  items,
  onFilmPress,
  onNextLoad,
  ListHeaderComponent,
  ListEmptyComponent,
  disableStatusbarSafeArea,
  onContinueWatching,
  onRemove,
  onToggleWatched,
}: FilmListContainerProps & { onFilmPress: NonNullable<FilmListContainerProps['onFilmPress']> }) {
  const styles = useThemedStyles(componentStyles);
  const { top } = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<FilmListItem>) => (
      <MemoizedFilmListRow
        item={ item }
        index={ index }
        styles={ styles }
        onFilmPress={ onFilmPress }
        onContinueWatching={ onContinueWatching }
        onRemove={ onRemove }
        onToggleWatched={ onToggleWatched }
      />
    ),
    [onFilmPress, onContinueWatching, onRemove, onToggleWatched, styles],
  );

  const renderHeader = useCallback(
    () => <View style={ { height: disableStatusbarSafeArea ? 0 : top } } />,
    [top, disableStatusbarSafeArea],
  );

  return (
    <ThemedGrid
      data={ items }
      numberOfColumns={ NUMBER_OF_COLUMNS }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      ListHeaderComponent={ ListHeaderComponent ?? renderHeader }
      ListEmptyComponent={ ListEmptyComponent }
    />
  );
}

export default FilmListComponent;
