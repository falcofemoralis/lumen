import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
import { useCallback } from 'react';
import { Dimensions, DimensionValue, View } from 'react-native';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationVirtualizedGrid,
} from 'react-tv-space-navigation';
import FilmCardInterface from 'Type/FilmCard.interface';
import { scale } from 'Util/CreateStyles';
import { NUMBER_OF_COLUMNS_TV } from './Grid.config';
import { styles } from './Grid.style.atv';
import { GridComponentProps } from './Grid.type';

export function GridComponent(props: GridComponentProps) {
  const { films, handleOnPress } = props;
  const windowWidth = Dimensions.get('window').width;

  const renderItem = useCallback(
    ({ item }: { item: FilmCardInterface }) => {
      return (
        <SpatialNavigationFocusableView onSelect={() => handleOnPress(item)}>
          {({ isFocused, isRootActive }) => (
            <View
              style={[
                { width: windowWidth / NUMBER_OF_COLUMNS_TV - styles.rowStyle.gap },
                isFocused && isRootActive ? { borderWidth: 2, borderColor: 'blue' } : {},
              ]}
            >
              <FilmCard filmCard={item} />
            </View>
          )}
        </SpatialNavigationFocusableView>
      );
    },
    [windowWidth]
  );

  return (
    <View>
      <SpatialNavigationVirtualizedGrid
        data={films}
        renderItem={renderItem}
        itemHeight={scale(CARD_HEIGHT_TV)}
        numberOfColumns={NUMBER_OF_COLUMNS_TV}
        scrollInterval={150}
        rowContainerStyle={styles.rowStyle}
      />
    </View>
  );
}

export default GridComponent;
