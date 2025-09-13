import { withTV } from 'Hooks/withTV';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import LoggerStore from 'Store/Logger.store';
import { noopFn } from 'Util/Function';

import ThemedGridComponent from './ThemedGrid.component';
import ThemedGridComponentTV from './ThemedGrid.component.atv';
import { ThemedGridContainerProps } from './ThemedGrid.type';

export function ThemedGridContainer({
  data,
  numberOfColumns,
  itemSize,
  style,
  rowStyle,
  header,
  headerSize,
  ListEmptyComponent,
  renderItem,
  onNextLoad,
}: ThemedGridContainerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updatingStateRef = useRef(false);

  useEffect(() => {
    updatingStateRef.current = false;
  }, [data]);

  const loadNextPage = async (onLoading: (state: boolean) => void, isRefresh = false) => {
    if (!updatingStateRef.current) {
      updatingStateRef.current = true;

      onLoading(true);

      try {
        if (onNextLoad) {
          await onNextLoad(isRefresh);
        }
      } catch (error) {
        LoggerStore.error('loadNextPage', { error });

        updatingStateRef.current = false;
      } finally {
        onLoading(false);
      }
    }
  };

  const handleScrollEnd = async () => {
    loadNextPage(noopFn);
  };

  const handleRefresh = async () => {
    loadNextPage((state) => setIsRefreshing(state), true);
  };

  const containerFunctions = {
    handleScrollEnd,
    handleRefresh,
  };

  const containerProps = () => ({
    data,
    numberOfColumns,
    isRefreshing,
    itemSize,
    style,
    rowStyle,
    header,
    headerSize,
    ListEmptyComponent,
    renderItem,
  });

  return withTV(ThemedGridComponentTV, ThemedGridComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default ThemedGridContainer;
