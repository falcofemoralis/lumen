import { useConfigContext } from 'Context/ConfigContext';
import {
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
  ListHeaderComponent,
  scrollBehavior,
  renderItem,
  onNextLoad,
}: ThemedGridContainerProps) {
  const { isTV } = useConfigContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updatingStateRef = useRef(false);

  const loadNextPage = async (onLoading: (state: boolean) => void, isRefresh = false) => {
    if (!updatingStateRef.current) {
      updatingStateRef.current = true;

      onLoading(true);

      try {
        if (onNextLoad) {
          await onNextLoad(isRefresh);
        }
      } finally {
        onLoading(false);
        requestAnimationFrame(() => {
          setTimeout(() => {
            updatingStateRef.current = false;
          }, 50);
        });
      }
    }
  };

  const handleScrollEnd = async () => {
    loadNextPage(noopFn);
  };

  const handleRefresh = async () => {
    loadNextPage((state) => setIsRefreshing(state), true);
  };

  const containerProps = {
    data,
    numberOfColumns,
    isRefreshing,
    itemSize,
    style,
    rowStyle,
    header,
    headerSize,
    scrollBehavior,
    ListHeaderComponent,
    renderItem,
    handleScrollEnd,
    handleRefresh,
  };

  return isTV ? <ThemedGridComponentTV { ...containerProps } /> : <ThemedGridComponent { ...containerProps } />;

}

export default ThemedGridContainer;
