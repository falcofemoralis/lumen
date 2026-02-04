import { useConfigContext } from 'Context/ConfigContext';
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
  scrollBehavior = 'stick-to-start',
  renderItem,
  handleScrollEnd,
}: ThemedGridComponentProps) => {
  const { isTVGridAnimation } = useConfigContext();
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
      additionalRenderedRows={ 2 }
      scrollBehavior={ scrollBehavior }
      scrollDuration={ isTVGridAnimation ? 250 : 0 }
      header={ header }
      headerSize={ headerSize }
    />
  );
};

export default ThemedGridComponent;
