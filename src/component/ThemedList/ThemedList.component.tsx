import { LegendList, LegendListRef } from '@legendapp/list';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useWindowDimensions } from 'react-native';

import { ThemedListComponentProps, ThemedListRef } from './ThemedList.type';

export const ThemedListComponent = forwardRef<ThemedListRef, ThemedListComponentProps>(({
  data,
  estimatedItemSize,
  getEstimatedItemSize,
  renderItem,
  onNextLoad,
  keyExtractor,
}, ref) => {
  const legendListRef = useRef<LegendListRef>(null);
  const { height } = useWindowDimensions();

  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => {
      legendListRef.current?.scrollToIndex({ index, animated: false });
    },
  }));

  return (
    <LegendList
      ref={ legendListRef }
      data={ data }
      numColumns={ 1 }
      estimatedItemSize={ estimatedItemSize }
      getEstimatedItemSize={ getEstimatedItemSize }
      renderItem={ renderItem }
      keyExtractor={ keyExtractor ? keyExtractor : (item, idx) => `${item.id}-row-${idx}` }
      recycleItems
      showsVerticalScrollIndicator={ false }
      onEndReached={ () => {
        onNextLoad?.();
      } }
      drawDistance={ height }
    />
  );
});

export default ThemedListComponent;
