import FilmCard from 'Component/FilmCard';
import { calculateCardDimensions } from 'Component/FilmCard/FilmCard.style.atv';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, {
  memo,
  useCallback,
  useMemo,
} from 'react';
import { View } from 'react-native';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationView,
  SpatialNavigationVirtualizedList,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS_TV } from './FilmList.config';
import { HEADER_HEIGHT, ROW_GAP, styles } from './FilmList.style.atv';
import {
  FilmListComponentProps,
  FilmListItem,
  FilmListRowProps,
} from './FilmList.type';

const FilmListRow = ({
  row,
  itemSize,
  handleOnPress,
}: FilmListRowProps) => {
  const { header, content, films = [] } = row;

  const renderContent = () => (
    <View>
      { content }
    </View>
  );

  const renderHeader = () => (
    <View style={ styles.container }>
      <ThemedText style={ styles.headerText }>
        { header }
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={ styles.container }>
      { content && renderContent() }
      { header && renderHeader() }
      <SpatialNavigationView
        direction="horizontal"
        alignInGrid
        style={ styles.rowStyle }
      >
        { films.map((item, index) => (
          <SpatialNavigationFocusableView
            // eslint-disable-next-line react/no-array-index-key
            key={ index }
            onSelect={ () => handleOnPress(item) }
          >
            { ({ isFocused }) => (
              <FilmCard
                filmCard={ item }
                isFocused={ isFocused }
                style={ { width: itemSize } }
              />
            ) }
          </SpatialNavigationFocusableView>
        )) }
      </SpatialNavigationView>
    </ThemedView>
  );
};

const MemoizedFilmListRow = memo(FilmListRow);

export function FilmListComponent({
  data,
  contentHeight = 0,
  handleOnPress,
}: FilmListComponentProps) {
  const { width, height } = calculateCardDimensions(
    NUMBER_OF_COLUMNS_TV,
    scale(ROW_GAP),
    scale(ROW_GAP) * 2,
  );

  const renderItem = useCallback(({ item: row }: {item: FilmListItem}) => (
    <MemoizedFilmListRow
      row={ row }
      itemSize={ width }
      numberOfColumns={ NUMBER_OF_COLUMNS_TV }
      handleOnPress={ handleOnPress }
    />
  ), []);

  const calculatedHeights = useMemo(() => data.reduce((acc, item) => {
    acc[item.index] = (height + scale(ROW_GAP) * 2)
      + (item.header ? scale(HEADER_HEIGHT) : 0)
      + (item.content ? contentHeight : 0);

    return acc;
  }, {} as Record<string, number>), [data]);

  const getCalculatedItemSize = useCallback((
    item: FilmListItem,
  ) => calculatedHeights[item.index], [calculatedHeights]);

  return (
    <SpatialNavigationVirtualizedList
      data={ data }
      renderItem={ renderItem }
      itemSize={ getCalculatedItemSize }
      additionalItemsRendered={ 1 }
      scrollDuration={ 0 }
      style={ styles.grid }
      orientation="vertical"
      isGrid
    />
  );
}

export default FilmListComponent;
