import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
import ThemedList from 'Component/ThemedList';
import { ThemedListRowProps } from 'Component/ThemedList/ThemedList.type';
import React, { useCallback, useMemo } from 'react';
import {
  SpatialNavigationFocusableView,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

import { NUMBER_OF_COLUMNS_TV } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style.atv';
import { FilmGridComponentProps, FilmGridItemType } from './FilmGrid.type';

const containerWidth = getWindowWidth() - scale(ROW_GAP * 2);

export function FilmGridComponent({
  films,
  onNextLoad,
  handleOnPress,
  handleItemFocus,
}: FilmGridComponentProps) {
  const renderItem = useCallback(({ item, index }: ThemedListRowProps<FilmGridItemType>) => {
    const { isThumbnail } = item;

    return (
      <SpatialNavigationFocusableView
        onSelect={ () => handleOnPress(item) }
        onFocus={ () => handleItemFocus(index) }
      >
        { ({ isFocused, isRootActive }) => (
          <FilmCard
            filmCard={ item }
            style={ {
              width: containerWidth / NUMBER_OF_COLUMNS_TV - scale(styles.rowStyle.gap),
            } }
            isFocused={ isFocused && isRootActive }
            isThumbnail={ isThumbnail }
          />
        ) }
      </SpatialNavigationFocusableView>
    );
  }, [containerWidth, handleItemFocus, handleOnPress]);

  const filmsData = useMemo(() => films.map((element, index) => ({ ...element, index })), [films]);

  return (
    <ThemedList
      data={ filmsData }
      renderItem={ renderItem }
      itemHeight={ CARD_HEIGHT_TV + scale(ROW_GAP) }
      numberOfColumns={ NUMBER_OF_COLUMNS_TV }
      rowStyle={ styles.rowStyle }
      style={ styles.grid }
      onNextLoad={ onNextLoad }
    />
  );
}

export default FilmGridComponent;
