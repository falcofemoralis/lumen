import { useMemo } from 'react';
import { SpatialNavigationVirtualizedGrid } from 'react-tv-space-navigation';

import { SCROLL_EVENT_UPDATES_MS_TV } from './ThemedList.config';
import { ThemedListComponentProps } from './ThemedList.type';

export const ThemedListComponent = ({
  data,
  itemSize,
  numberOfColumns,
  style,
  rowStyle,
  renderItem,
  handleScrollEnd,
}: ThemedListComponentProps) => {
  const memoData = useMemo(() => data.map((element, index) => ({ ...element, index })), [data]);

  return (
    <SpatialNavigationVirtualizedGrid
      data={ memoData }
      renderItem={ renderItem }
      itemHeight={ itemSize }
      numberOfColumns={ numberOfColumns }
      scrollInterval={ SCROLL_EVENT_UPDATES_MS_TV }
      rowContainerStyle={ rowStyle }
      onEndReached={ handleScrollEnd }
      onEndReachedThresholdRowsNumber={ 2 }
      style={ style }
      additionalRenderedRows={ 1 }
      // scrollDuration={ 350 }
    />
  );
};

export default ThemedListComponent;
