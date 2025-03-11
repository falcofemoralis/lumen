import { FlashList } from '@shopify/flash-list';
import FilmCard from 'Component/FilmCard';
import { calculateCardDimensions } from 'Component/FilmCard/FilmCard.style';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS } from './FilmList.config';
import { ROW_GAP, styles } from './FilmList.style';
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
  const { content, header, films = [] } = row;

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
      <View style={ styles.gridRow }>
        { films.map((item) => (
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
  data,
  handleOnPress,
}: FilmListComponentProps) {
  const { width, height } = calculateCardDimensions(NUMBER_OF_COLUMNS, scale(ROW_GAP));

  const renderItem = useCallback(({ item: row }: {item: FilmListItem}) => (
    <MemoizedFilmListRow
      row={ row }
      itemSize={ width }
      numberOfColumns={ NUMBER_OF_COLUMNS }
      handleOnPress={ handleOnPress }
    />
  ), []);

  return (
    <FlashList
      data={ data }
      numColumns={ 1 }
      estimatedItemSize={ height }
      renderItem={ renderItem }
      keyExtractor={ (item) => `${item.index}-film-list-row` }
    />
  );
}

export default FilmListComponent;
