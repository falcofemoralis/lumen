import { LegendList } from '@legendapp/list';
import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail';
import { useFilmCardDimensions } from 'Component/FilmCard/useFilmCardDimensions';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { componentStyles } from './FilmSections.style';
import {
  FilmSectionsComponentProps,
  FilmSectionsItem,
  FilmSectionsRowProps,
} from './FilmSections.type';

const FilmSectionsRow = ({
  index,
  row,
  itemSize,
  handleOnPress,
  styles,
}: FilmSectionsRowProps) => {
  const { content, header, films = [], isPlaceholder } = row;

  const renderContent = () => (
    <View>
      { content }
    </View>
  );

  const renderHeader = () => (
    <View>
      <ThemedText style={ styles.headerText }>
        { header }
      </ThemedText>
    </View>
  );

  if (isPlaceholder) {
    return (
      <View>
        { content && renderContent() }
        <View style={ styles.gridRow }>
          { films.map((item, idx) => (
            <FilmCardThumbnail
              // eslint-disable-next-line react/no-array-index-key
              key={ `${index}-${idx}-${item.id}` }
              width={ itemSize || 0 }
            />
          )) }
        </View>
      </View>
    );
  }

  return (
    <View>
      { content && renderContent() }
      { header && renderHeader() }
      <View style={ styles.gridRow }>
        { films.map((item, idx) => (
          <Pressable
            // eslint-disable-next-line react/no-array-index-key
            key={ `${index}-${idx}-${item.id}` }
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

const MemoizedFilmSectionsRow = memo(FilmSectionsRow);

export function FilmSectionsComponent({
  data: films,
  handleOnPress,
}: FilmSectionsComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { numberOfColumnsMobile } = useConfigContext();
  const { width, height } = useFilmCardDimensions(numberOfColumnsMobile, styles.gridRow.gap);

  const renderItem = useCallback(({ item: row, index }: {item: FilmSectionsItem, index: number}) => (
    <MemoizedFilmSectionsRow
      index={ index }
      row={ row }
      itemSize={ width }
      numberOfColumns={ numberOfColumnsMobile }
      handleOnPress={ handleOnPress }
      styles={ styles }
    />
  ), [width, styles]);

  const data = useMemo(() => films.map(
    (row) => ({
      ...row,
    })
  ), [films]);

  return (
    <LegendList
      data={ data }
      numColumns={ 1 }
      estimatedItemSize={ height }
      renderItem={ renderItem }
      keyExtractor={ (item) => `${item.index}-film-list-row` }
      recycleItems
      showsVerticalScrollIndicator={ false }
    />
  );
}

export default FilmSectionsComponent;
