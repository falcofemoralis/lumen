/* eslint-disable max-len */
import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail';
import { useFilmCardDimensions } from 'Component/FilmCard/useFilmCardDimensions';
import { ThemedGrid } from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from 'Theme/context';
import { calculateRows } from 'Util/List';

import { THUMBNAILS_ROWS } from './FilmGrid.config';
import { componentStyles, ROW_GAP } from './FilmGrid.style';
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
  const { scale } = useAppTheme();
  const styles = useThemedStyles(componentStyles);
  const { width, height } = useFilmCardDimensions(numberOfColumns, scale(ROW_GAP));
  const { top } = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item: row }: ThemedGridRowProps<FilmGridRowType>) => {
      const { items } = row;

      if (row.isPlaceholder) {
        return (
          <View style={ styles.gridRow }>
            { items.map((item) => (
              <FilmCardThumbnail key={ item.id } width={ width } />
            )) }
          </View>
        );
      }

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
    [width, handleOnPress, styles]
  );

  const data = useMemo(() => {
    if (!films.length) {
      return calculateRows(
        new Array(numberOfColumns * THUMBNAILS_ROWS).fill(null).map((_, index) => ({ id: `film-placeholder-${index}` })),
        numberOfColumns
      ).map((items) => ({
        id: items[0].id,
        items,
        isPlaceholder: true,
      }));
    }

    return calculateRows(
      films,
      numberOfColumns
    ).map((items) => ({ id: items[0].id, items, width })); // width is required to make array unique with different width value
  }, [films, width, numberOfColumns]); // width is required to recalculate rows after orientation change

  return (
    <ThemedGrid
      data={ data }
      numberOfColumns={ 1 }
      itemSize={ height }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      style={ styles.grid }
      ListHeaderComponent={ <View style={ { height: top } } /> }
    />
  );
}

export default FilmGridComponent;
