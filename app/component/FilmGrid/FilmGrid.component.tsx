import FilmCard from 'Component/FilmCard';
import FilmCardInterface from 'Type/FilmCard.interface';
import { noopFn } from 'Util/Function';
import React, { memo, useCallback } from 'react';
import {
  DimensionValue,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NUMBER_OF_COLUMNS,
  SCROLL_EVENT_END_PADDING,
  SCROLL_EVENT_UPDATES_MS,
} from './FilmGrid.config';
import { FilmGridComponentProps, FilmGridRowProps } from './FilmGrid.type';

function GridRow({ item, handleOnPress }: FilmGridRowProps) {
  console.log('render row ', item[0].title);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        width: '100%',
      }}
    >
      {item.map((film, idx) => (
        <TouchableOpacity
          key={`${film.id}-item-${idx}`}
          style={{ width: (100 / NUMBER_OF_COLUMNS + '%') as DimensionValue }}
          onPress={() => handleOnPress(film)}
        >
          <FilmCard filmCard={film} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function rowPropsAreEqual(prevProps: FilmGridRowProps, props: FilmGridRowProps) {
  return prevProps.item[0].id === props.item[0].id;
}

const MemoizedGridRow = memo(GridRow, rowPropsAreEqual);

export function GridComponent(props: FilmGridComponentProps) {
  const { rows, handleOnPress, onScrollEnd, onRefresh = noopFn, isRefreshing = false } = props;

  const onScroll = useCallback(
    async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const isCloseToBottom = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = SCROLL_EVENT_END_PADDING;

        return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
      };

      if (isCloseToBottom(event)) {
        onScrollEnd();
      }
    },
    [onScrollEnd]
  );

  const renderRow: ListRenderItem<FilmCardInterface[]> = useCallback(
    ({ item }) => {
      return (
        <MemoizedGridRow
          item={item}
          handleOnPress={handleOnPress}
        />
      );
    },
    [handleOnPress]
  );

  return (
    <FlatList
      data={rows}
      renderItem={renderRow}
      keyExtractor={(item, idx) => `${item[0].id}-row-${idx}`}
      onScroll={onScroll}
      scrollEventThrottle={SCROLL_EVENT_UPDATES_MS}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      }
      removeClippedSubviews={true}
      initialNumToRender={5}
    />
  );
}

export default GridComponent;
