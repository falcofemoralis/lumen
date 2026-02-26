import { LegendList } from '@legendapp/list';
import { useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { noopFn } from 'Util/Function';

import { ThemedGridComponentProps } from './ThemedGrid.type';

export const ThemedGridComponent = ({
  data,
  numberOfColumns,
  itemSize,
  isRefreshing = false,
  ListHeaderComponent,
  ListEmptyComponent,
  renderItem,
  handleScrollEnd,
  handleRefresh = noopFn,
}: ThemedGridComponentProps) => {
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
      refreshControl={ renderRefreshControl() }
      keyExtractor={ (item, idx) => `${item.id}-row-${idx}` }
      recycleItems
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
