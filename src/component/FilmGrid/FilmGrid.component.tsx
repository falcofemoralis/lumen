import FilmCard from 'Component/FilmCard';
import ThemedList from 'Component/ThemedList';
import { ThemedListRowProps } from 'Component/ThemedList/ThemedList.type';
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
  itemSize,
  handleOnPress,
}: FilmGridItemProps) {
  return (
    <Pressable
      style={ { width: itemSize } }
      onPress={ () => handleOnPress(item) }
    >
      <FilmCard
        style={ styles.gridItem }
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
    ({ item, index }: ThemedListRowProps<FilmGridItemType>) => (
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
    <ThemedList
      data={ films }
      numberOfColumns={ NUMBER_OF_COLUMNS }
      itemSize={ itemWidth }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
    />
  );
}

export default FilmGridComponent;
