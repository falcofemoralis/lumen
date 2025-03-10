import FilmCard from 'Component/FilmCard';
import { calculateCardDimensions } from 'Component/FilmCard/FilmCard.style';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import React, { memo, useCallback, useMemo } from 'react';
import {
  Pressable,
  View,
} from 'react-native';
import { scale } from 'Util/CreateStyles';
import { calculateRows } from 'Util/List';

import { NUMBER_OF_COLUMNS } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style';
import {
  FilmGridComponentProps, FilmGridItemProps, FilmGridRowType,
} from './FilmGrid.type';

function FilmGridItem({
  row,
  index,
  width,
  handleOnPress,
}: FilmGridItemProps) {
  const { items } = row;

  return (
    <View style={ styles.gridRow }>
      { items.map((item, innerIndex) => (
        <Pressable
          key={ item.id !== '' ? item.id : `film-grid-thumb-${index}-${innerIndex}` }
          style={ { width } }
          onPress={ () => handleOnPress(item) }
        >
          <FilmCard
            filmCard={ item }
            isThumbnail={ item.isThumbnail }
          />
        </Pressable>
      )) }
    </View>
  );
}

function rowPropsAreEqual(prevProps: FilmGridItemProps, props: FilmGridItemProps) {
  return prevProps.row.id === props.row.id;
}

const MemoizedGridItem = memo(FilmGridItem, rowPropsAreEqual);

export function FilmGridComponent({
  films,
  handleOnPress,
  onNextLoad,
}: FilmGridComponentProps) {
  const { width, height } = calculateCardDimensions(NUMBER_OF_COLUMNS, scale(ROW_GAP));

  const renderItem = useCallback(
    ({ item: row, index }: ThemedGridRowProps<FilmGridRowType>) => (
      <MemoizedGridItem
        index={ index }
        row={ row }
        width={ width }
        handleOnPress={ handleOnPress }
      />
    ),
    [],
  );

  const data = useMemo(() => calculateRows(
    films, NUMBER_OF_COLUMNS,
  ).map((items) => ({
    id: items[0].id,
    items,
  })), [films]);

  return (
    <ThemedGrid
      data={ data }
      numberOfColumns={ 1 }
      itemSize={ height }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      style={ styles.grid }
    />
  );
}

export default FilmGridComponent;
