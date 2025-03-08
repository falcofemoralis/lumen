import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT } from 'Component/FilmCard/FilmCard.style';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import React, { memo, useCallback } from 'react';
import {
  Pressable,
} from 'react-native';
import { calculateItemSize } from 'Style/Layout';

import { NUMBER_OF_COLUMNS } from './FilmGrid.config';
import { styles } from './FilmGrid.style';
import { FilmGridComponentProps, FilmGridItemProps, FilmGridItemType } from './FilmGrid.type';

function FilmGridItem({
  item,
  index,
  itemSize,
  handleOnPress,
}: FilmGridItemProps) {
  const { gap } = styles.grid;

  const halfGap = gap / 2;
  const column = index % NUMBER_OF_COLUMNS;

  return (
    <Pressable
      style={ { width: itemSize } }
      onPress={ () => handleOnPress(item) }
    >
      <FilmCard
        style={ {
          paddingRight: column < NUMBER_OF_COLUMNS - 1 ? halfGap : 0,
          paddingLeft: column > 0 ? halfGap : 0,
          paddingBottom: gap,
        } }
        filmCard={ item }
        isThumbnail={ item.isThumbnail }
      />
    </Pressable>
  );
}

function rowPropsAreEqual(prevProps: FilmGridItemProps, props: FilmGridItemProps) {
  return prevProps.item.id === props.item.id;
}

const MemoizedGridItem = memo(FilmGridItem, rowPropsAreEqual);

export function FilmGridComponent({
  films,
  handleOnPress,
  onNextLoad,
}: FilmGridComponentProps) {
  const itemWidth = calculateItemSize(NUMBER_OF_COLUMNS);

  const renderItem = useCallback(
    ({ item, index }: ThemedGridRowProps<FilmGridItemType>) => (
      <MemoizedGridItem
        index={ index }
        item={ item }
        handleOnPress={ handleOnPress }
        itemSize={ itemWidth }
      />
    ),
    [handleOnPress, itemWidth],
  );

  return (
    <ThemedGrid
      data={ films }
      numberOfColumns={ NUMBER_OF_COLUMNS }
      itemSize={ CARD_HEIGHT }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
    />
  );
}

export default FilmGridComponent;
