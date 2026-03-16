import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { useFilmCardDimensions } from 'Component/FilmCard/useFilmCardDimensions';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { ThemedPressable } from 'Component/ThemedPressable';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { DefaultFocus } from 'react-tv-space-navigation';
import { useAppTheme } from 'Theme/context';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { noopFn } from 'Util/Function';

import { THUMBNAILS_ROWS_TV } from './FilmGrid.config';
import { componentStyles, ROW_GAP } from './FilmGrid.style.atv';
import { FilmGridComponentProps, FilmGridItemProps } from './FilmGrid.type';

function FilmGridItem({
  row,
  index,
  width,
  handleOnPress,
  handleItemFocus = noopFn,
}: FilmGridItemProps) {
  const { items } = row;
  const item = items[0];

  if (item.isPlaceholder) {
    return <FilmCardThumbnail width={ width } />;
  }

  return (
    <ThemedPressable
      onPress={ () => handleOnPress(item) }
      onFocus={ () => handleItemFocus(index) }
    >
      { ({ isFocused, isRootActive }) => (
        <FilmCard
          filmCard={ item }
          style={ { width } }
          isFocused={ isFocused && isRootActive }
        />
      ) }
    </ThemedPressable>
  );
}

function rowPropsAreEqual(prevProps: FilmGridItemProps, props: FilmGridItemProps) {
  return prevProps.row.items[0].id === props.row.items[0].id;
}

const MemoizedGridItem = memo(FilmGridItem, rowPropsAreEqual);

export function FilmGridComponent({
  films,
  numberOfColumns,
  isGridVisible,
  isEmpty,
  ListHeaderComponent,
  ListEmptyComponent,
  menuDefaultFocus,
  onNextLoad,
  handleOnPress,
  handleItemFocus,
}: FilmGridComponentProps) {
  const { scale } = useAppTheme();

  const styles = useThemedStyles(componentStyles);
  const { width, height } = useFilmCardDimensions(
    numberOfColumns,
    scale(ROW_GAP),
    scale(ROW_GAP) // paddingHorizontal
  );

  const actualHeight = useMemo(() => height + scale(ROW_GAP), [height, scale]);

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<FilmCardInterface>) => (
    <DefaultFocus enable={ menuDefaultFocus ? false : index === 0 }>
      <View style={ { height: actualHeight } }>
        <MemoizedGridItem
          index={ index }
          row={ { id: String(index), items: [item] } }
          width={ width }
          handleOnPress={ handleOnPress }
          handleItemFocus={ handleItemFocus }
        />
      </View>
    </DefaultFocus>
  ), [width, actualHeight, handleOnPress, handleItemFocus]);

  const filmsData = useMemo(
    () => {
      if (isEmpty) {
        return [];
      }

      if (!films.length) {
        return new Array(numberOfColumns * THUMBNAILS_ROWS_TV).fill(null).map((_, index) => ({
          id: `film-placeholder-${index}`,
          isPlaceholder: true,
          index,
        }));
      }

      return films.map((element, index) => ({ ...element, index }));
    },
    [films, numberOfColumns, isEmpty]
  );

  return (
    <ThemedGrid
      style={ styles.grid }
      rowStyle={ styles.rowStyle }
      data={ filmsData }
      numberOfColumns={ numberOfColumns }
      itemSize={ actualHeight }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      ListHeaderComponent={ ListHeaderComponent }
      ListEmptyComponent={ isGridVisible ? ListEmptyComponent : null }
      tvOptimized
    />
  );
}

export default FilmGridComponent;
