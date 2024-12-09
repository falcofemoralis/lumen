import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedGrid,
} from 'react-tv-space-navigation';
import FilmCardInterface from 'Type/FilmCard.interface';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';
import { NUMBER_OF_COLUMNS_TV, SCROLL_EVENT_UPDATES_MS_TV } from './FilmGrid.config';
import { ROW_GAP, styles } from './FilmGrid.style.atv';
import { FilmGridComponentProps } from './FilmGrid.type';

export function GridComponent(props: FilmGridComponentProps) {
  const { films, handleOnPress, onScrollEnd } = props;
  const windowWidth = getWindowWidth() - ROW_GAP;

  const renderItem = ({ item }: { item: FilmCardInterface }) => {
    return (
      <SpatialNavigationFocusableView onSelect={() => handleOnPress(item)}>
        {({ isFocused, isRootActive }) => (
          <FilmCard
            filmCard={item}
            style={{
              width: scale(windowWidth / NUMBER_OF_COLUMNS_TV - styles.rowStyle.gap),
            }}
            isFocused={isFocused && isRootActive}
          />
        )}
      </SpatialNavigationFocusableView>
    );
  };

  return (
    <SpatialNavigationVirtualizedGrid
      data={films}
      renderItem={renderItem}
      itemHeight={scale(CARD_HEIGHT_TV + ROW_GAP)}
      numberOfColumns={NUMBER_OF_COLUMNS_TV}
      scrollInterval={SCROLL_EVENT_UPDATES_MS_TV}
      rowContainerStyle={styles.rowStyle}
      onEndReached={onScrollEnd}
      onEndReachedThresholdRowsNumber={2}
      style={styles.container}
    />
  );
}

export default GridComponent;
