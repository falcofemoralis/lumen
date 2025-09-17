import FilmCard from 'Component/FilmCard';
import { useFilmCardDimensions } from 'Component/FilmCard/FilmCard.style';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import React, { useCallback, useMemo } from 'react';
import {
  Pressable,
  View,
} from 'react-native';
import { scale } from 'Util/CreateStyles';
import { calculateRows } from 'Util/List';

import { NUMBER_OF_COLUMNS } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style';
import { FilmGridThumbnail } from './FilmGrid.thumbnail';
import {
  FilmGridComponentProps,
  FilmGridRowType,
} from './FilmGrid.type';

export function FilmGridComponent({
  films,
  handleOnPress,
  onNextLoad,
}: FilmGridComponentProps) {
  const { width, height } = useFilmCardDimensions(NUMBER_OF_COLUMNS, scale(ROW_GAP));

  const renderItem = useCallback(
    ({ item: row }: ThemedGridRowProps<FilmGridRowType>) => {
      const { items } = row;

      return (
        <View style={ styles.gridRow }>
          { items.map((item, index) => (
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
    [width]
  );

  const data = useMemo(() => calculateRows(
    films, NUMBER_OF_COLUMNS
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
      ListEmptyComponent={ <FilmGridThumbnail /> }
    />
  );
}

export default FilmGridComponent;
