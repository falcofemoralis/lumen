/* eslint-disable no-plusplus */
import { withTV } from 'Hooks/withTV';
import {
  memo, useEffect, useRef, useState,
} from 'react';
import { noopFn } from 'Util/Function';

import ThemedListComponent from './ThemedList.component';
import ThemedListComponentTV from './ThemedList.component.atv';
import { ThemedListContainerProps } from './ThemedList.type';

export function ThemedListContainer({
  data,
  numberOfColumns,
  itemSize,
  style,
  rowStyle,
  renderItem,
  onNextLoad,
}: ThemedListContainerProps) {
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
    renderItem,
  });

  return withTV(ThemedListComponentTV, ThemedListComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

function propsAreEqual(prevProps: ThemedListContainerProps, props: ThemedListContainerProps) {
  return JSON.stringify(prevProps.data) === JSON.stringify(props.data);
}

export default memo(ThemedListContainer, propsAreEqual);
