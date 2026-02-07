import { useConfigContext } from 'Context/ConfigContext';
import { useEffect, useMemo, useRef } from 'react';
import { SpatialNavigationVirtualizedGrid, SpatialNavigationVirtualizedListRef } from 'react-tv-space-navigation';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

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
  const listRef = useRef<SpatialNavigationVirtualizedListRef>(null);

  const memoData = useMemo(() => data.map((element, index) => ({ ...element, index })), [data]);

  useEffect(() => {
    const keyDownListener = (type: SupportedKeys) => {
      if (type === SupportedKeys.BACKWARD) {
        listRef.current?.focus(0);

        return true;
      }

      return false;
    };

    const remoteControlDownListener = RemoteControlManager.addKeydownListener(keyDownListener);

    return () => {
      RemoteControlManager.removeKeydownListener(remoteControlDownListener);
    };
  }, []);

  return (
    <SpatialNavigationVirtualizedGrid
      ref={ listRef }
      data={ memoData }
      renderItem={ renderItem }
      itemHeight={ itemSize }
      numberOfColumns={ numberOfColumns }
      scrollInterval={ SCROLL_EVENT_UPDATES_MS_TV }
      rowContainerStyle={ rowStyle }
      onEndReached={ handleScrollEnd }
      onEndReachedThresholdRowsNumber={ 1 }
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
