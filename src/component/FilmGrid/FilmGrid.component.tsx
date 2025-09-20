import FilmCard from 'Component/FilmCard';
import { useFilmCardDimensions } from 'Component/FilmCard/FilmCard.style';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from 'Util/CreateStyles';
import { calculateRows } from 'Util/List';

import { ROW_GAP, styles } from './FilmGrid.style';
import { FilmGridThumbnail } from './FilmGrid.thumbnail';
import {
  FilmGridComponentProps,
  FilmGridRowType,
} from './FilmGrid.type';

export function FilmGridComponent({
  films,
  numberOfColumns,
  handleOnPress,
  onNextLoad,
}: FilmGridComponentProps) {
  const { width, height } = useFilmCardDimensions(numberOfColumns, scale(ROW_GAP));
  const { top } = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item: row }: ThemedGridRowProps<FilmGridRowType>) => {
      const { items } = row;

      return (
        <View style={ styles.gridRow }>
          { items.map((item) => (
            <Pressable
              key={ item.id }
              style={ { width } }
              onPress={ () => handleOnPress(item) }
            >
              <FilmCard filmCard={ item } />
            </Pressable>
          )) }
        </View>
      );
    },
    [width, handleOnPress]
  );

  const data = useMemo(() => calculateRows(
    films, numberOfColumns
  ).map((items) => ({
    id: items[0].id,
    items,
  })), [films, width, numberOfColumns]); // width is required to recalculate rows after orientation change

  return (
    <ThemedGrid
      data={ data }
      numberOfColumns={ 1 }
      itemSize={ height }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      style={ styles.grid }
      ListEmptyComponent={ <FilmGridThumbnail numberOfColumns={ numberOfColumns } /> }
      ListHeaderComponent={ <View style={ { height: top } } /> }
    />
  );
}

export default FilmGridComponent;
