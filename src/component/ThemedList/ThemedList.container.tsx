/* eslint-disable no-plusplus */
import { withTV } from 'Hooks/withTV';
import { memo, useRef, useState } from 'react';
import ConfigStore from 'Store/Config.store';
import { noopFn } from 'Util/Function';

import ThemedListComponent from './ThemedList.component';
import ThemedListComponentTV from './ThemedList.component.atv';
import { ThemedListContainerProps } from './ThemedList.type';

export function ThemedListContainer({
  data,
  numberOfColumns,
  itemHeight,
  style,
  rowStyle,
  renderItem,
  onNextLoad,
}: ThemedListContainerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updatingStateRef = useRef(false);

  const calculateRows = () => {
    const columns: any[][] = Array.from({ length: numberOfColumns }, () => []);

    data.forEach((film, index) => {
      columns[index % numberOfColumns].push(film);
    });

    const rows: any[][] = [];
    for (let i = 0; i < columns[0].length; i++) {
      const row: any[] = [];
      for (let j = 0; j < numberOfColumns; j++) {
        if (columns[j][i] !== undefined) {
          row.push(columns[j][i]);
        }
      }
      rows.push(row);
    }

    return rows;
  };

  const loadNextPage = async (onLoading: (state: boolean) => void, isRefresh = false) => {
    if (!updatingStateRef.current) {
      updatingStateRef.current = true;

      onLoading(true);

      try {
        if (onNextLoad) {
          await onNextLoad(isRefresh);
        }
      } finally {
        updatingStateRef.current = false;
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
    rows: !ConfigStore.isTV ? calculateRows() : [], // TV version do not use rows
    numberOfColumns,
    isRefreshing,
    itemHeight,
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
