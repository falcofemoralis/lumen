import { useCallback } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from 'react-native';
import { noopFn } from 'Util/Function';
import { isCloseToBottom } from 'Util/Scroll';

import { SCROLL_EVENT_END_PADDING, SCROLL_EVENT_UPDATES_MS } from './ThemedList.config';
import { ThemedListComponentProps } from './ThemedList.type';

export const ThemedListComponent = ({
  rows,
  renderItem,
  handleScrollEnd,
  handleRefresh = noopFn,
  isRefreshing = false,
}: ThemedListComponentProps) => {
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
    <FlatList
      data={ rows }
      renderItem={ renderItem }
      // eslint-disable-next-line react-perf/jsx-no-new-function-as-prop -- idx is unique
      keyExtractor={ (item, idx) => `${item[0].id}-row-${idx}` }
      onScroll={ onScroll }
      scrollEventThrottle={ SCROLL_EVENT_UPDATES_MS }
      refreshControl={ renderRefreshControl() }
    />
  );
};

export default ThemedListComponent;
