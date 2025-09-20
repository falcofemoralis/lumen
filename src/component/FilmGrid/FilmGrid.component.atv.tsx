import FilmCard from 'Component/FilmCard';
import { calculateCardDimensions } from 'Component/FilmCard/FilmCard.style.atv';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import React, { memo, useCallback, useMemo } from 'react';
import {
  SpatialNavigationFocusableView,
} from 'react-tv-space-navigation';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { scale } from 'Util/CreateStyles';
import { noopFn } from 'Util/Function';

import { ROW_GAP, styles } from './FilmGrid.style.atv';
import { FilmGridThumbnail } from './FilmGrid.thumbnail.atv';
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

  return (
    <SpatialNavigationFocusableView
      onSelect={ () => handleOnPress(item) }
      onFocus={ () => handleItemFocus(index) }
    >
      { ({ isFocused, isRootActive }) => (
        <FilmCard
          filmCard={ item }
          style={ { width } }
          isFocused={ isFocused && isRootActive }
        />
      ) }
    </SpatialNavigationFocusableView>
  );
}

function rowPropsAreEqual(prevProps: FilmGridItemProps, props: FilmGridItemProps) {
  return prevProps.row.items[0].id === props.row.items[0].id;
}

const MemoizedGridItem = memo(FilmGridItem, rowPropsAreEqual);

export function FilmGridComponent({
  films,
  header,
  headerSize,
  numberOfColumns,
  onNextLoad,
  handleOnPress,
  handleItemFocus,
}: FilmGridComponentProps) {
  const { width, height } = calculateCardDimensions(
    numberOfColumns,
    scale(ROW_GAP),
    scale(ROW_GAP) * 2
  );

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<FilmCardInterface>) => (
    <MemoizedGridItem
      index={ index }
      row={ { id: String(index), items: [item] } }
      width={ width }
      handleOnPress={ handleOnPress }
      handleItemFocus={ handleItemFocus }
    />
  ), [width, handleOnPress, handleItemFocus]);

  const filmsData = useMemo(
    () => films.map((element, index) => ({ ...element, index })), [films]
  );

  return (
    <ThemedGrid
      style={ styles.grid }
      rowStyle={ styles.rowStyle }
      data={ filmsData }
      numberOfColumns={ numberOfColumns }
      itemSize={ height + scale(ROW_GAP) * 2 }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      header={ header }
      headerSize={ headerSize }
      ListEmptyComponent={ <FilmGridThumbnail numberOfColumns={ numberOfColumns } /> }
    />
  );
}

export default FilmGridComponent;
