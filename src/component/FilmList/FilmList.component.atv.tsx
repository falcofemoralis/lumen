import FilmCard from 'Component/FilmCard';
import { CARD_HEIGHT_TV } from 'Component/FilmCard/FilmCard.style.atv';
import ThemedText from 'Component/ThemedText';
import ThemedView from 'Component/ThemedView';
import React, {
  useCallback,
  useMemo,
} from 'react';
import {
  SpatialNavigationFocusableView,
  SpatialNavigationScrollView,
  SpatialNavigationView,
  SpatialNavigationVirtualizedList,
} from 'react-tv-space-navigation';
import { scale } from 'Util/CreateStyles';
import { getWindowWidth } from 'Util/Window';

import { HEADER_HEIGHT, ROW_GAP, styles } from './FilmList.style.atv';
import {
  FilmListComponentProps,
  FilmListItem, FilmListItemType,
} from './FilmList.type';

const containerWidth = getWindowWidth() - scale(ROW_GAP * 2);

export function FilmListComponent({
  data: initialData,
  offsetFromStart = 0,
  numberOfColumns,
  handleOnPress,
  calculateRows,
}: FilmListComponentProps) {
  // const [isItemsVisible, setIsItemsVisible] = useState(false);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setIsItemsVisible(true);
  //   }, 500);
  // }, []);

  const renderItem = useCallback(({ item: row }: {item: FilmListItem}) => {
    const { type } = row;

    if (type === FilmListItemType.HEADER) {
      const { header } = row;

      return (
        <ThemedView style={ { width: containerWidth } }>
          <ThemedText style={ styles.headerText }>
            { header }
          </ThemedText>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={ { width: containerWidth } }>
        <SpatialNavigationScrollView horizontal>
          <SpatialNavigationView
            direction="horizontal"
            alignInGrid
            style={ styles.gridItem }
          >
            { row.films?.map((item) => (
              <SpatialNavigationFocusableView
                key={ item.id }
                onSelect={ () => handleOnPress(item) }
              >
                { ({ isFocused }) => (
                  <FilmCard
                    filmCard={ item }
                    isFocused={ isFocused }
                    style={ {
                      width: containerWidth / numberOfColumns - scale(ROW_GAP),
                    } }
                  />
                ) }
              </SpatialNavigationFocusableView>
            )) }
          </SpatialNavigationView>
        </SpatialNavigationScrollView>
      </ThemedView>
    );
  }, [numberOfColumns]);

  const data = useMemo(() => initialData.reduce((acc, item, index) => {
    acc.push({
      index,
      header: item.header,
      type: FilmListItemType.HEADER,
    });

    const rows = calculateRows(item.films).map((row, innerIndex) => ({
      index: acc.length + innerIndex,
      films: row,
      type: FilmListItemType.FILM,
    }));

    acc.push(...rows);

    return acc;
  }, [] as FilmListItem[]), [initialData, calculateRows]);

  const getItemSize = useCallback((item: FilmListItem) => {
    if (item.type === FilmListItemType.HEADER) {
      return HEADER_HEIGHT;
    }

    if (item.index === data.length - 1) {
      return CARD_HEIGHT_TV + offsetFromStart * 2;
    }

    return CARD_HEIGHT_TV + ROW_GAP * 2;
  }, [data, offsetFromStart]);

  return (
    <SpatialNavigationVirtualizedList
      data={ data }
      renderItem={ renderItem }
      itemSize={ getItemSize }
      additionalItemsRendered={ 1 }
      style={ styles.grid }
      orientation="vertical"
      isGrid
    />
  );
}

export default FilmListComponent;
