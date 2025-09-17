import { LegendList } from '@legendapp/list';
import React, { useCallback, useEffect } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from 'react-native';
import { noopFn } from 'Util/Function';
import { isCloseToBottom } from 'Util/Scroll';

import { SCROLL_EVENT_END_PADDING } from './ThemedGrid.config';
import { ThemedGridComponentProps } from './ThemedGrid.type';

export const ThemedGridComponent = ({
  data,
  numberOfColumns,
  itemSize,
  isRefreshing = false,
  ListEmptyComponent,
  renderItem,
  handleScrollEnd,
  handleRefresh = noopFn,
}: ThemedGridComponentProps) => {
  const scrollFuncRef = React.useRef<() => void>(handleScrollEnd);

  useEffect(() => {
    scrollFuncRef.current = handleScrollEnd;
  }, [handleScrollEnd]);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isCloseToBottom(event, SCROLL_EVENT_END_PADDING)) {
      scrollFuncRef.current();
    }
  }, []);

  const renderRefreshControl = useCallback(() => (
    <RefreshControl
      refreshing={ isRefreshing }
      onRefresh={ handleRefresh }
    />
  ), [isRefreshing, handleRefresh]);

  return (
    <LegendList
      data={ data }
      numColumns={ numberOfColumns }
      estimatedItemSize={ itemSize }
      renderItem={ renderItem }
      onScroll={ onScroll }
      refreshControl={ renderRefreshControl() }
      keyExtractor={ (item, idx) => `${item.id}-row-${idx}` }
      ListEmptyComponent={ ListEmptyComponent }
      recycleItems
      showsVerticalScrollIndicator={ false }
    />
  );
};

export default ThemedGridComponent;
