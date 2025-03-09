import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
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
  SpatialNavigationScrollView,
  SpatialNavigationView,
  SpatialNavigationVirtualizedList,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

import { HEADER_HEIGHT, ROW_GAP, styles } from './FilmList.style.atv';
import {
  FilmListComponentProps,
  FilmListItem,
  FilmListRowProps,
} from './FilmList.type';

const containerWidth = getWindowWidth() - scale(ROW_GAP * 2);

const FilmListRow = ({
  row,
  numberOfColumns,
  handleOnPress,
}: FilmListRowProps) => {
  const { header, content } = row;

  const renderContent = () => (
    <View>
      { content }
    </View>
  );

  const renderHeader = () => (
    <View style={ { width: containerWidth } }>
      <ThemedText style={ styles.headerText }>
        { header }
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={ { width: containerWidth } }>
      { content && renderContent() }
      { header && renderHeader() }
      <SpatialNavigationScrollView horizontal>
        <SpatialNavigationView
          direction="horizontal"
          alignInGrid
          style={ styles.gridItem }
        >
          { row.films?.map((item) => (
            <SpatialNavigationFocusableView
              key={ item.id }
              onSelect={ () => handleOnPress(item) }
            >
              { ({ isFocused }) => (
                <FilmCard
                  filmCard={ item }
                  isFocused={ isFocused }
                  style={ {
                    width: containerWidth / numberOfColumns - scale(ROW_GAP),
                  } }
                />
              ) }
            </SpatialNavigationFocusableView>
          )) }
        </SpatialNavigationView>
      </SpatialNavigationScrollView>
    </ThemedView>
  );
};

function rowPropsAreEqual(prevProps: FilmListRowProps, props: FilmListRowProps) {
  return prevProps.row.index === props.row.index;
}

const MemoizedFilmListRow = memo(FilmListRow, rowPropsAreEqual);

export function FilmListComponent({
  data: initialData,
  children,
  numberOfColumns,
  contentHeight = 0,
  handleOnPress,
  calculateRows,
}: FilmListComponentProps) {
  const renderItem = useCallback(({ item: row }: {item: FilmListItem}) => (
    <MemoizedFilmListRow
      row={ row }
      numberOfColumns={ numberOfColumns }
      handleOnPress={ handleOnPress }
    />
  ), [numberOfColumns]);

  const data = useMemo(() => {
    const items = initialData.reduce((acc, item) => {
      const rows = calculateRows(item.films).map<FilmListItem>((row) => ({
        index: -1,
        films: row,
      }));

      if (rows.length > 0) {
        rows[0].header = item.header;
      }

      acc.push(...rows);

      return acc;
    }, [] as FilmListItem[]);

    if (items.length > 0) {
      items[0].content = children;
    }

    return items.map((item, index) => ({
      ...item,
      index,
    }));
  }, [initialData, calculateRows]);

  const calculatedHeights = useMemo(() => data.reduce((acc, item) => {
    acc[item.index] = CARD_HEIGHT_TV
      + ROW_GAP * 2
      + (item.header ? scale(HEADER_HEIGHT) : 0)
      + (item.content ? contentHeight : 0);

    return acc;
  }, {} as Record<string, number>), [data, contentHeight]);

  const getCalculatedItemSize = useCallback((
    item: FilmListItem,
  ) => calculatedHeights[item.index], [calculatedHeights]);

  return (
    <SpatialNavigationVirtualizedList
      data={ data }
      renderItem={ renderItem }
      itemSize={ getCalculatedItemSize }
      additionalItemsRendered={ 1 }
      style={ styles.grid }
      orientation="vertical"
      isGrid
    />
  );
}

export default FilmListComponent;
