import FilmCard from 'Component/FilmCard';
import { calculateCardDimensionsTV } from 'Component/FilmCard/FilmCard.style.atv';
import ThemedGrid from 'Component/ThemedGrid';
import { ThemedGridRowProps } from 'Component/ThemedGrid/ThemedGrid.type';
import React, { useCallback, useMemo } from 'react';
import {
  SpatialNavigationFocusableView,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS_TV } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style.atv';
import { FilmGridComponentProps, FilmGridItemType } from './FilmGrid.type';

export function FilmGridComponent({
  films,
  header,
  headerSize,
  onNextLoad,
  handleOnPress,
  handleItemFocus,
}: FilmGridComponentProps) {
  const { width, height } = calculateCardDimensionsTV(
    NUMBER_OF_COLUMNS_TV,
    scale(ROW_GAP),
    scale(ROW_GAP) * 2,
  );

  const renderItem = useCallback(({ item, index }: ThemedGridRowProps<FilmGridItemType>) => {
    const { isThumbnail } = item;

    console.log('renderItem', item.title);

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
            isThumbnail={ isThumbnail }
          />
        ) }
      </SpatialNavigationFocusableView>
    );
  }, [handleItemFocus, handleOnPress]);

  const filmsData = useMemo(() => films.map((element, index) => ({ ...element, index })), [films]);

  return (
    <ThemedGrid
      style={ styles.grid }
      rowStyle={ styles.rowStyle }
      data={ filmsData }
      numberOfColumns={ NUMBER_OF_COLUMNS_TV }
      itemSize={ height }
      renderItem={ renderItem }
      onNextLoad={ onNextLoad }
      header={ header }
      headerSize={ headerSize }
    />
  );
}

export default FilmGridComponent;
