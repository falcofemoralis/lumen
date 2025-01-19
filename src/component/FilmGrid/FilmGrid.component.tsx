import FilmCard from 'Component/FilmCard';
import ThemedList from 'Component/ThemedList';
import { ThemedListRowProps } from 'Component/ThemedList/ThemedList.type';
import React, { memo, useCallback } from 'react';
import {
  DimensionValue,
  Pressable,
  View,
} from 'react-native';
import { FilmCardInterface } from 'Type/FilmCard.interface';

import { NUMBER_OF_COLUMNS } from './FilmGrid.config';
import { FilmGridComponentProps, FilmGridRowProps } from './FilmGrid.type';

function FilmGridRow({
  item,
  handleOnPress,
}: FilmGridRowProps) {
  return (
    <View
      style={ {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
      } }
    >
      { item.map((film, idx) => (
        <Pressable
          // eslint-disable-next-line react/no-array-index-key -- idx is unique
          key={ `${film.id}-item-${idx}` }
          style={ { width: (`${100 / NUMBER_OF_COLUMNS}%`) as DimensionValue } }
          onPress={ () => handleOnPress(film) }
        >
          <FilmCard
            filmCard={ film }
            isThumbnail={ film.isThumbnail }
          />
        </Pressable>
      )) }
    </View>
  );
}

function rowPropsAreEqual(prevProps: FilmGridRowProps, props: FilmGridRowProps) {
  return prevProps.item[0].id === props.item[0].id;
}

const MemoizedGridRow = memo(FilmGridRow, rowPropsAreEqual);

export function FilmGridComponent({
  films,
  handleOnPress,
  onNextLoad,
}: FilmGridComponentProps) {
  const renderRow = useCallback(
    ({ item }: ThemedListRowProps<FilmCardInterface[]>) => (
      <MemoizedGridRow
        item={ item }
        handleOnPress={ handleOnPress }
      />
    ),
    [handleOnPress],
  );

  return (
    <ThemedList
      data={ films }
      renderItem={ renderRow }
      onNextLoad={ onNextLoad }
      numberOfColumns={ NUMBER_OF_COLUMNS }
    />
  );
}

export default FilmGridComponent;
