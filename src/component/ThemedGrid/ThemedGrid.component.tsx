import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
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
