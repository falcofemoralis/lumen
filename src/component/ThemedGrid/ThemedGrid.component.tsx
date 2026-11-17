import { useRetainedScroll } from 'Hooks/useRetainedScroll';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { RefreshControl } from 'react-native';
import { noopFn } from 'Util/Function';

import { ThemedGridComponentProps } from './ThemedGrid.type';

export const ThemedGridComponent = ({
  data,
  numberOfColumns,
  style,
  isRefreshing = false,
  disableRefresh = false,
  ListHeaderComponent,
  ListEmptyComponent,
  renderItem,
  handleScrollEnd,
  handleRefresh = noopFn,
}: ThemedGridComponentProps) => {
  const listRef = useRef<FlashListRef<any>>(null);
  const retained = useRetainedScroll(listRef);
  // Without a refresh control the downward drag at the top of the list is left
  // unconsumed, so a host like a bottom sheet can take it over as a dismiss gesture.
  const renderRefreshControl = useCallback(() => (disableRefresh ? undefined : (
    <RefreshControl
      refreshing={ isRefreshing }
      onRefresh={ handleRefresh }
    />
  )), [disableRefresh, isRefreshing, handleRefresh]);

  // FlashList's renderItem must return an element, the prop returns a ReactNode.
  const renderCell = useCallback(({ item, index }: { item: any; index: number }) => (
    <>{ renderItem({ item, index }) }</>
  ), [renderItem]);

  return (
    <FlashList
      ref={ listRef }
      onScroll={ retained.enabled ? retained.onScroll : undefined }
      onLayout={ retained.enabled ? retained.onLayout : undefined }
      scrollEventThrottle={ retained.enabled ? 100 : undefined }
      data={ data }
      style={ style }
      numColumns={ numberOfColumns }
      renderItem={ renderCell }
      refreshControl={ renderRefreshControl() }
      keyExtractor={ (item, idx) => `${item.id}-row-${idx}` }
      showsVerticalScrollIndicator={ false }
      ListHeaderComponent={ ListHeaderComponent }
      ListEmptyComponent={ ListEmptyComponent }
      onEndReached={ handleScrollEnd }
      onEndReachedThreshold={ 0.25 }
      contentContainerStyle={ { flexGrow: 1 } }
    />
  );
};

export default ThemedGridComponent;
