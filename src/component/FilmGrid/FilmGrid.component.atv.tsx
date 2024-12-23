import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
import { useMemo } from 'react';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedGrid,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

import { NUMBER_OF_COLUMNS_TV, SCROLL_EVENT_UPDATES_MS_TV } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style.atv';
import { FilmGridComponentProps, FilmGridItem } from './FilmGrid.type';

export function FilmGridComponent({
  films,
  handleOnPress,
  onScrollEnd,
}: FilmGridComponentProps) {
  const containerWidth = getWindowWidth() - scale(ROW_GAP * 2);

  const renderItem = ({ item }: { item: FilmGridItem }) => {
    const { isThumbnail } = item;

    return (
      <SpatialNavigationFocusableView onSelect={ () => handleOnPress(item) }>
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
  };

  const filmsData = useMemo(() => films.map((element, index) => ({ ...element, index })), [films]);

  return (
    <SpatialNavigationVirtualizedGrid
      data={ filmsData }
      renderItem={ renderItem }
      itemHeight={ CARD_HEIGHT_TV + scale(ROW_GAP) }
      numberOfColumns={ NUMBER_OF_COLUMNS_TV }
      scrollInterval={ SCROLL_EVENT_UPDATES_MS_TV }
      rowContainerStyle={ styles.rowStyle }
      onEndReached={ onScrollEnd }
      onEndReachedThresholdRowsNumber={ 2 }
      style={ styles.container }
    />
  );
}

export default FilmGridComponent;
