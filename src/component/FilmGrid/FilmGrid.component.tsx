import FilmCard from 'Component/FilmCard';
import React, { memo, useCallback } from 'react';
import {
  DimensionValue,
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { noopFn } from 'Util/Function';
import { isCloseToBottom } from 'Util/Scroll';

import {
  NUMBER_OF_COLUMNS,
  SCROLL_EVENT_END_PADDING,
  SCROLL_EVENT_UPDATES_MS,
} from './FilmGrid.config';
import { FilmGridComponentProps, FilmGridRowProps } from './FilmGrid.type';

function FilmGridRow({
  item,
  handleOnPress,
}: FilmGridRowProps) {
  return (
    <View
      style={ {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
      } }
    >
      { item.map((film, idx) => (
        <Pressable
          // eslint-disable-next-line react/no-array-index-key -- idx is unique
          key={ `${film.id}-item-${idx}` }
          style={ { width: (`${100 / NUMBER_OF_COLUMNS}%`) as DimensionValue } }
          onPress={ () => handleOnPress(film) }
        >
          <FilmCard
            filmCard={ film }
            isThumbnail={ film.isThumbnail }
          />
        </Pressable>
      )) }
    </View>
  );
}

function rowPropsAreEqual(prevProps: FilmGridRowProps, props: FilmGridRowProps) {
  return prevProps.item[0].id === props.item[0].id;
}

const MemoizedGridRow = memo(FilmGridRow, rowPropsAreEqual);

export function FilmGridComponent({
  rows,
  handleOnPress,
  onScrollEnd,
  onRefresh = noopFn,
  isRefreshing = false,
}: FilmGridComponentProps) {
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isCloseToBottom(event, SCROLL_EVENT_END_PADDING)) {
        onScrollEnd();
      }
    },
    [onScrollEnd],
  );

  const renderRow: ListRenderItem<FilmCardInterface[]> = useCallback(
    ({ item }) => (
      <MemoizedGridRow
        item={ item }
        handleOnPress={ handleOnPress }
      />
    ),
    [handleOnPress],
  );

  const renderRefreshControl = useCallback(() => (
    <RefreshControl
      refreshing={ isRefreshing }
      onRefresh={ onRefresh }
    />
  ), [isRefreshing, onRefresh]);

  // TODO replace with flashlist
  return (
    <FlatList
      data={ rows }
      renderItem={ renderRow }
      // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop -- idx is unique
      keyExtractor={ (item, idx) => `${item[0].id}-row-${idx}` }
      onScroll={ onScroll }
      scrollEventThrottle={ SCROLL_EVENT_UPDATES_MS }
      refreshControl={ renderRefreshControl() }
      removeClippedSubviews
      initialNumToRender={ 5 }
    />
  );
}

export default FilmGridComponent;
