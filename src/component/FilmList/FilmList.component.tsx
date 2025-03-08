import { FlashList } from '@shopify/flash-list';
import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT } from 'Component/FilmCard/FilmCard.style';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable } from 'react-native';
import { calculateItemSize } from 'Style/Layout';

import { styles } from './FilmList.style';
import {
  FilmListComponentProps,
  FilmListItem,
  FilmListItemType,
  FilmListRowProps,
} from './FilmList.type';

const FilmListRow = ({
  row,
  itemSize,
  children,
  handleOnPress,
}: FilmListRowProps) => {
  const { type } = row;

  if (type === FilmListItemType.CONTENT) {
    return children;
  }

  if (type === FilmListItemType.HEADER) {
    const { header: text } = row;

    return (
      <ThemedView>
        <ThemedText style={ styles.headerText }>
          { text }
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={ styles.gridItem }>
      { row.films?.map((item) => (
        <Pressable
          key={ item.id }
          style={ { width: itemSize } }
          onPress={ () => handleOnPress(item) }
        >
          <FilmCard
            filmCard={ item }
          />
        </Pressable>
      )) }
    </ThemedView>
  );
};

function rowPropsAreEqual(prevProps: FilmListRowProps, props: FilmListRowProps) {
  return prevProps.row.index === props.row.index;
}

const MemoizedFilmListRow = memo(FilmListRow, rowPropsAreEqual);

export function FilmListComponent({
  data: initialData,
  numberOfColumns,
  children,
  handleOnPress,
  calculateRows,
}: FilmListComponentProps) {
  const itemWidth = calculateItemSize(numberOfColumns);

  const renderItem = useCallback(({ item: row }: {item: FilmListItem}) => (
    <MemoizedFilmListRow
      row={ row }
      itemSize={ itemWidth }
      handleOnPress={ handleOnPress }
    >
      { children }
    </MemoizedFilmListRow>
  ), [numberOfColumns, children]);

  const data = useMemo(() => {
    const memoData: FilmListItem[] = [];

    if (children) {
      memoData.push({
        index: -1,
        type: FilmListItemType.CONTENT,
      });
    }

    return initialData.reduce((acc, item, index) => {
      acc.push({
        index,
        header: item.header,
        type: FilmListItemType.HEADER,
      });

      const rows = calculateRows(item.films).map((row, innerIndex) => ({
        index: (acc.length - 1) + innerIndex,
        films: row,
        type: FilmListItemType.FILM,
      }));

      acc.push(...rows);

      return acc;
    }, memoData);
  }, [initialData, children, calculateRows]);

  return (
    <FlashList
      data={ data }
      numColumns={ 1 }
      estimatedItemSize={ CARD_HEIGHT }
      renderItem={ renderItem }
    />
  );
}

export default FilmListComponent;
