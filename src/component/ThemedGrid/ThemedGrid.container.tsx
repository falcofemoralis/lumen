import { withTV } from 'Hooks/withTV';
import {
  memo,
  useEffect,
  useRef,
  useState,
} from 'react';
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
      } catch (e) {
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
    renderItem,
  });

  return withTV(ThemedGridComponentTV, ThemedGridComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

function propsAreEqual(prevProps: ThemedGridContainerProps, props: ThemedGridContainerProps) {
  return JSON.stringify(prevProps.data) === JSON.stringify(props.data);
}

export default memo(ThemedGridContainer, propsAreEqual);
