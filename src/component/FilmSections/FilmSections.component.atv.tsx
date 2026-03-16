import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { useFilmCardDimensions } from 'Component/FilmCard/useFilmCardDimensions';
import { useGridLayout } from 'Component/ThemedGrid/useGridLayout';
import { ThemedPressable } from 'Component/ThemedPressable';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import {
  memo,
  useCallback,
  useMemo,
} from 'react';
import { View } from 'react-native';
import {
  SpatialNavigationView,
  SpatialNavigationVirtualizedList,
} from 'react-tv-space-navigation';
import { ThemedStyles } from 'Theme/types';

import { componentStyles } from './FilmSections.style.atv';
import {
  FilmSectionsComponentProps,
  FilmSectionsItem,
  FilmSectionsRowProps,
} from './FilmSections.type';

const FilmSectionsRow = ({
  index,
  row,
  itemSize,
  containerWidth,
  styles,
  handleOnPress,
}: FilmSectionsRowProps & { styles: ThemedStyles<typeof componentStyles> }) => {
  const { header, films = [], isPlaceholder = false } = row;

  const renderHeader = () => (
    <View style={ styles.container }>
      <ThemedText style={ styles.headerText }>
        { header }
      </ThemedText>
    </View>
  );

  if (isPlaceholder) {
    return (
      <View
        style={ [
          styles.container,
          { width: containerWidth },
        ] }
      >
        <View style={ styles.rowStyle }>
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
    <View
      style={ [
        styles.container,
        { width: containerWidth },
      ] }
    >
      { header && renderHeader() }
      <SpatialNavigationView
        direction="horizontal"
        alignInGrid
        style={ styles.rowStyle }
      >
        { films.map((item, idx) => (
          <ThemedPressable
            // eslint-disable-next-line react/no-array-index-key
            key={ `${index}-${idx}-${item.id}` }
            onPress={ () => handleOnPress(item) }
          >
            { ({ isFocused }) => (
              <FilmCard
                filmCard={ item }
                isFocused={ isFocused }
                style={ { width: itemSize } }
              />
            ) }
          </ThemedPressable>
        )) }
      </SpatialNavigationView>
    </View>
  );
};

const MemoizedFilmSectionsRow = memo(FilmSectionsRow);

export function FilmSectionsComponent({
  data,
  children,
  handleOnPress,
}: FilmSectionsComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { numberOfColumnsTV, isTVGridAnimation } = useConfigContext();
  const { width, height } = useFilmCardDimensions(
    numberOfColumnsTV,
    styles.rowStyle.gap,
    styles.rowStyle.gap * 2
  );

  const { gridWidth } = useGridLayout(1);

  const calculatedHeights = useMemo(() => data.reduce((acc, item) => {
    acc[item.index] = (height + styles.rowStyle.gap * 2)
      + (item.header ? styles.headerText.fontSize : 0);

    return acc;
  }, {} as Record<string, number>), [data, styles]);

  const renderItem = useCallback(({ item: row, index }: {item: FilmSectionsItem, index: number}) => (
    <View style={ { height: calculatedHeights[index] } }>
      <MemoizedFilmSectionsRow
        index={ index }
        row={ row }
        itemSize={ width }
        numberOfColumns={ numberOfColumnsTV }
        handleOnPress={ handleOnPress }
        containerWidth={ gridWidth }
        styles={ styles }
      />
    </View>
  ), [styles, calculatedHeights]);

  const getCalculatedItemSize = useCallback((
    item: FilmSectionsItem
  ) => {
    return calculatedHeights[item.index];
  }, [calculatedHeights]);

  return (
    <SpatialNavigationVirtualizedList
      data={ data }
      renderItem={ renderItem }
      itemSize={ getCalculatedItemSize }
      additionalItemsRendered={ 1 }
      scrollDuration={ isTVGridAnimation ? 250 : 0 }
      style={ styles.grid }
      orientation="vertical"
      isGrid
      isFlatlist
      paddingBottom={ height }
      ListHeaderComponent={ children }
    />
  );
}

export default FilmSectionsComponent;
