import { LegendList } from '@legendapp/list';
import FilmCard from 'Component/FilmCard';
import { useFilmCardDimensions } from 'Component/FilmCard/FilmCard.style';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { scale } from 'Util/CreateStyles';

import { NUMBER_OF_COLUMNS } from './FilmSections.config';
import { ROW_GAP, styles } from './FilmSections.style';
import {
  FilmSectionsComponentProps,
  FilmSectionsItem,
  FilmSectionsRowProps,
} from './FilmSections.type';

const FilmSectionsRow = ({
  row,
  itemSize,
  handleOnPress,
}: FilmSectionsRowProps) => {
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
        { films.map((item, index) => (
          <Pressable
            // eslint-disable-next-line react/no-array-index-key
            key={ index }
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

function rowPropsAreEqual(prevProps: FilmSectionsRowProps, props: FilmSectionsRowProps) {
  return prevProps.row.index === props.row.index && prevProps.itemSize === props.itemSize;
}

const MemoizedFilmSectionsRow = memo(FilmSectionsRow, rowPropsAreEqual);

export function FilmSectionsComponent({
  data: films,
  handleOnPress,
}: FilmSectionsComponentProps) {
  const { width, height } = useFilmCardDimensions(NUMBER_OF_COLUMNS, scale(ROW_GAP));

  const renderItem = useCallback(({ item: row }: {item: FilmSectionsItem}) => (
    <MemoizedFilmSectionsRow
      row={ row }
      itemSize={ width }
      numberOfColumns={ NUMBER_OF_COLUMNS }
      handleOnPress={ handleOnPress }
    />
  ), [width]);

  const data = useMemo(() => films.map(
    (row) => ({
      ...row,
    }),
  ), [films, width]);

  return (
    <LegendList
      data={ data }
      numColumns={ 1 }
      estimatedItemSize={ height }
      renderItem={ renderItem }
      keyExtractor={ (item) => `${item.index}-film-list-row` }
      recycleItems
    />
  );
}

export default FilmSectionsComponent;
