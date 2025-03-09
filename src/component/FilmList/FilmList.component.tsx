import { FlashList } from '@shopify/flash-list';
import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT } from 'Component/FilmCard/FilmCard.style';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { calculateItemSize } from 'Style/Layout';

import { styles } from './FilmList.style';
import {
  FilmListComponentProps,
  FilmListItem,
  FilmListRowProps,
} from './FilmList.type';

const FilmListRow = ({
  row,
  itemSize,
  handleOnPress,
}: FilmListRowProps) => {
  const { content, header } = row;

  const renderContent = () => (
    <View>
      { content }
    </View>
  );

  const renderHeader = () => (
    <ThemedView>
      <ThemedText style={ styles.headerText }>
        { header }
      </ThemedText>
    </ThemedView>
  );

  return (
    <View>
      { content && renderContent() }
      { header && renderHeader() }
      <View style={ styles.gridItem }>
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
      </View>
    </View>
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
      numberOfColumns={ numberOfColumns }
      handleOnPress={ handleOnPress }
    />
  ), [numberOfColumns, children]);

  const data = useMemo(() => {
    const items = initialData.reduce((acc, item) => {
      const rows = calculateRows(item.films).map<FilmListItem>((row) => ({
        index: -1,
        films: row,
      }));

      if (rows.length > 0) {
        rows[0].header = item.header;
      }

      acc.push(...rows);

      return acc;
    }, [] as FilmListItem[]);

    if (items.length > 0) {
      items[0].content = children;
    }

    return items.map((item, index) => ({
      ...item,
      index,
    }));
  }, [initialData, calculateRows]);

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
