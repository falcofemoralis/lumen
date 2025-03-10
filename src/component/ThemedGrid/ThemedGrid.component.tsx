import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from 'react-native';
import { noopFn } from 'Util/Function';
import { isCloseToBottom } from 'Util/Scroll';

import { SCROLL_EVENT_END_PADDING, SCROLL_EVENT_UPDATES_MS } from './ThemedGrid.config';
import { ThemedGridComponentProps } from './ThemedGrid.type';

export const ThemedGridComponent = ({
  data,
  numberOfColumns,
  itemSize,
  isRefreshing = false,
  renderItem,
  handleScrollEnd,
  handleRefresh = noopFn,
}: ThemedGridComponentProps) => {
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isCloseToBottom(event, SCROLL_EVENT_END_PADDING)) {
        handleScrollEnd();
      }
    },
    [handleScrollEnd],
  );

  const renderRefreshControl = useCallback(() => (
    <RefreshControl
      refreshing={ isRefreshing }
      onRefresh={ handleRefresh }
    />
  ), [isRefreshing, handleRefresh]);

  return (
    <FlashList
      data={ data }
      numColumns={ numberOfColumns }
      estimatedItemSize={ itemSize }
      renderItem={ renderItem }
      onScroll={ onScroll }
      scrollEventThrottle={ SCROLL_EVENT_UPDATES_MS }
      refreshControl={ renderRefreshControl() }
      keyExtractor={ (item, idx) => `${item.id}-row-${idx}` }
    />
  );
};

export default ThemedGridComponent;
