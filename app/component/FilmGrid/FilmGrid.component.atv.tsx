import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
import { Dimensions, View } from 'react-native';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedGrid,
} from 'react-tv-space-navigation';
import FilmCardInterface from 'Type/FilmCard.interface';
import { scale } from 'Util/CreateStyles';
import { NUMBER_OF_COLUMNS_TV, SCROLL_EVENT_UPDATES_MS_TV } from './FilmGrid.config';
import { styles } from './FilmGrid.style.atv';
import { FilmGridComponentProps } from './FilmGrid.type';
import { NAVIGATION_BAR_TV_WIDTH } from 'Component/NavigationBar/NavigationBar.style.atv';

export function GridComponent(props: FilmGridComponentProps) {
  const { films, handleOnPress, onScrollEnd } = props;
  const windowWidth = Dimensions.get('window').width - scale(NAVIGATION_BAR_TV_WIDTH);

  const renderItem = ({ item }: { item: FilmCardInterface }) => {
    return (
      <SpatialNavigationFocusableView onSelect={() => handleOnPress(item)}>
        {({ isFocused, isRootActive }) => (
          <View
            style={[
              { width: windowWidth / NUMBER_OF_COLUMNS_TV - styles.rowStyle.gap },
              isFocused && isRootActive && styles.itemFocused,
            ]}
          >
            <FilmCard filmCard={item} />
          </View>
        )}
      </SpatialNavigationFocusableView>
    );
  };

  return (
    <SpatialNavigationVirtualizedGrid
      data={films}
      renderItem={renderItem}
      itemHeight={scale(CARD_HEIGHT_TV)}
      numberOfColumns={NUMBER_OF_COLUMNS_TV}
      scrollInterval={SCROLL_EVENT_UPDATES_MS_TV}
      rowContainerStyle={styles.rowStyle}
      onEndReached={onScrollEnd}
      onEndReachedThresholdRowsNumber={2}
    />
  );
}

export default GridComponent;
