import { useMemo } from 'react';
import { SpatialNavigationVirtualizedGrid } from 'react-tv-space-navigation';

import { SCROLL_EVENT_UPDATES_MS_TV } from './ThemedGrid.config';
import { ThemedGridComponentProps } from './ThemedGrid.type';

export const ThemedGridComponent = ({
  data,
  itemSize,
  numberOfColumns,
  style,
  rowStyle,
  header,
  headerSize,
  ListEmptyComponent,
  renderItem,
  handleScrollEnd,
}: ThemedGridComponentProps) => {
  const memoData = useMemo(() => data.map((element, index) => ({ ...element, index })), [data]);

  if (!memoData.length) {
    return ListEmptyComponent;
  }

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
      scrollDuration={ 0 }
      header={ header }
      headerSize={ headerSize }
    />
  );
};

export default ThemedGridComponent;
