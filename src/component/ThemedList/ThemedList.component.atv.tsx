/* eslint-disable max-len */
import { LegendList, LegendListRef } from '@legendapp/list';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { SpatialNavigationNode } from 'react-tv-space-navigation';

import { ItemWrapperWithVirtualParentContext, useRegisterVirtualNodes } from '../../libs/react-tv-space-navigation/spatial-navigation/components/virtualizedList/SpatialNavigationVirtualizedListWithVirtualNodes';
import { SpatialNavigatorParentScrollContext } from '../../libs/react-tv-space-navigation/spatial-navigation/context/ParentScrollContext';
import { ThemedListComponentProps, ThemedListRef } from './ThemedList.type';

export const ThemedListComponent = forwardRef<ThemedListRef, ThemedListComponentProps>(({
  data,
  estimatedItemSize,
  getEstimatedItemSize,
  renderItem,
  onNextLoad,
}, ref) => {
  const { height } = useWindowDimensions();
  const legendListRef = useRef<LegendListRef>(null);
  const { getNthVirtualNodeID } = useRegisterVirtualNodes({
    allItems: data,
    orientation: 'vertical',
    isGrid: false,
  });

  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => {
      legendListRef.current?.scrollToIndex({ index, animated: false });
    },
  }));

  const renderVirtualItem = useCallback(
    ({ item, index }: { item: any, index: number }) => (
      <ItemWrapperWithVirtualParentContext
        virtualParentID={ getNthVirtualNodeID(index) }
        renderItem={ renderItem }
        item={ item }
        index={ index }
      />
    ),
    [getNthVirtualNodeID, renderItem]
  );

  const scrollToItem = useCallback(
    (index: number) => {
      legendListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
    },
    []
  );

  const renderWrappedItem = useCallback(
    ({ item, index }: { item: any, index: number }) => (
      <SpatialNavigatorParentScrollContext.Provider value={ (_, __) => scrollToItem(index) }>
        { renderVirtualItem({ item, index }) }
      </SpatialNavigatorParentScrollContext.Provider>
    ),
    [renderVirtualItem, scrollToItem]
  );

  return (
    <SpatialNavigationNode
      orientation="vertical"
    >
      <LegendList
        ref={ legendListRef }
        data={ data }
        numColumns={ 1 }
        estimatedItemSize={ estimatedItemSize }
        getEstimatedItemSize={ getEstimatedItemSize }
        renderItem={ renderWrappedItem }
        keyExtractor={ (item, idx) => `${item.id}-row-${idx}` }
        recycleItems
        showsVerticalScrollIndicator={ false }
        scrollEnabled={ false }
        onEndReached={ () => {
          onNextLoad?.();
        } }
        drawDistance={ height }
      />
    </SpatialNavigationNode>
  );
});

export default ThemedListComponent;
