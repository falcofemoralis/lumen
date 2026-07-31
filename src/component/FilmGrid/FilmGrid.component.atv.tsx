import { FocusContext, FocusHandler, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { FilmCard } from 'Component/FilmCard';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { ScrollContext, useScrollContext } from 'Component/ThemedScrollView/ScrollContext';
import { useConfigContext } from 'Context/ConfigContext';
import { useDefaultFocus } from 'Hooks/useDefaultFocus';
import { memo, useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { useAppTheme } from 'Theme/context';
import { FilmType } from 'Type/FilmType.type';

import { THUMBNAILS_ROWS_TV } from './FilmGrid.config';
import { FOCUS_OVERFLOW_GAP, ROW_GAP } from './FilmGrid.style.atv';
import { FilmGridComponentProps, FilmGridItemProps, FilmGridRowItem } from './FilmGrid.type';

type FilmGridExtraProps = {
  item: FilmGridRowItem
}

function FilmGridItem({
  item,
  isLastRow,
  handleOnPress,
}: FilmGridItemProps) {
  const { scale } = useAppTheme();
  const { scrollTo } = useScrollContext();

  const onPress = useCallback(() => {
    const { isPlaceholder } = item;

    if (isPlaceholder) {
      return;
    }

    handleOnPress(item);
  }, [item, handleOnPress]);

  const { ref, focused } = useFocusable<FilmGridExtraProps>({
    // Loading placeholders must not be focusable: focusing one and then having
    // it swapped for the real film (different key -> unmount) makes Norigin
    // auto-restore focus, yanking the user back up.
    focusable: !item.isPlaceholder,
    onFocus: (layout, props, details) => {
      scrollTo?.(layout, props, details);
    },
    extraProps: { item },
    onEnterPress: onPress,
  });

  /**
   * A focused card grows around its centre, so half of that growth hangs below
   * its row. Focus scrolling can only bring an item's own box into view, so the
   * last row carries that overflow as padding -- otherwise the list has nothing
   * left to scroll and the viewport clips the focused card. Padding on the list
   * content or a footer does not work: `scrollToIndex` stops at the last item.
   */
  const style = useMemo(() => ({
    marginHorizontal: scale(ROW_GAP) / 2,
    paddingBottom: isLastRow ? scale(FOCUS_OVERFLOW_GAP) : 0,
  }), [scale, isLastRow]);

  const renderContent = () => {
    const { isPlaceholder } = item;

    if (isPlaceholder) {
      return <FilmCardThumbnail />;
    }

    return <FilmCard filmCard={ item } isFocused={ focused } />;
  };

  return (
    <Pressable
      ref={ ref }
      onPress={ onPress }
      style={ style }
      tvFocusable={ false }
    >
      { renderContent() }
    </Pressable>
  );
}

const MemoizedGridItem = memo(FilmGridItem);

export function FilmGridComponent({
  films,
  numberOfColumns,
  disableEmptyComponent,
  isEmpty,
  hideGrid,
  ListHeaderComponent,
  ListEmptyComponent,
  disableAutofocus,
  handleOnPress,
  handleScrollEnd,
  onAtTopChange,
}: FilmGridComponentProps) {
  const { scale } = useAppTheme();
  const { ref, focusKey } = useFocusable<object, View>({
    saveLastFocusedChild: true,
  });
  const listRef = useRef<FlashListRef<FilmGridRowItem>>(null);
  const lastRowRef = useRef(-1);
  const { isTVGridAnimation } = useConfigContext();

  // Focus the grid (restoring the last focused card via saveLastFocusedChild)
  // whenever the screen loads or is returned to. Enabled only once films are
  // available -- Norigin can't focus a card that isn't registered yet.
  useDefaultFocus(focusKey, !disableAutofocus && films.length > 0);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();

    films.forEach((film, index) => map.set(film.id, index));

    return map;
  }, [films]);

  const scrollTo: FocusHandler<FilmGridExtraProps> = useCallback((_layout, props) => {
    if (!props?.item) {
      return;
    }

    const index = indexById.get(props.item.id);

    if (index === undefined) {
      return;
    }

    // Only scroll when the focused row changes -- moving between items within a
    // row that is already on screen must not trigger an animated re-center,
    // which competes with the focus render on the JS thread and feels laggy.
    const row = Math.floor(index / numberOfColumns);

    if (row === lastRowRef.current) {
      return;
    }

    const prevRow = lastRowRef.current;

    lastRowRef.current = row;

    // Tell the pager to reveal/collapse the menu as focus crosses the first row.
    if ((prevRow === 0) !== (row === 0)) {
      onAtTopChange?.(row === 0);
    }

    listRef.current?.scrollToIndex({
      index: index,
      animated: true,
      viewPosition: 0.1,
    });
  }, [indexById, numberOfColumns, onAtTopChange]);

  const scrollContextValue = useMemo(() => ({ scrollTo }), [scrollTo]);

  const filmsData = useMemo( () => {
    if (isEmpty || hideGrid) {
      return [];
    }

    if (!films.length) {
      return new Array(numberOfColumns * THUMBNAILS_ROWS_TV).fill(null).map((_, index) => ({
        id: `film-placeholder-${index}`,
        link: '',
        type: FilmType.FILM,
        poster: '',
        title: '',
        subtitle: '',
        isPlaceholder: true,
      }));
    }

    return films;
  }, [isEmpty, hideGrid, films, numberOfColumns]);

  // Start of the last -- possibly partly filled -- row.
  const lastRowStartIndex = filmsData.length - ((filmsData.length - 1) % numberOfColumns + 1);

  const renderItem = useCallback(({ item, index }: {item: FilmGridRowItem, index: number}) => (
    <MemoizedGridItem
      index={ index }
      item={ item }
      isLastRow={ index >= lastRowStartIndex }
      handleOnPress={ handleOnPress }
    />
  ), [handleOnPress, lastRowStartIndex]);

  const contentContainerStyle = useMemo(() => ({
    paddingHorizontal: scale(ROW_GAP),
    paddingVertical: scale(ROW_GAP),
  }), [scale]);

  const ItemSeparator = useCallback(() => (
    <View style={ { height: scale(ROW_GAP) } } />
  ), [scale]);

  const keyExtractor = useCallback((item: FilmGridRowItem) => item.id, []);

  const getItemType = useCallback(
    (item: FilmGridRowItem) => (item.isPlaceholder ? 'placeholder' : 'film'),
    []
  );

  return (
    <FocusContext.Provider value={ focusKey }>
      <ScrollContext.Provider value={ scrollContextValue }>
        <View ref={ ref } style={ { flex: 1 } } tvFocusable={ false }>
          <FlashList
            ref={ listRef }
            data={ filmsData }
            renderItem={ renderItem }
            keyExtractor={ keyExtractor }
            getItemType={ getItemType }
            onEndReached={ handleScrollEnd }
            onEndReachedThreshold={ 0.5 }
            numColumns={ numberOfColumns }
            scrollEnabled={ true }
            contentContainerStyle={ contentContainerStyle }
            ItemSeparatorComponent={ ItemSeparator }
            ListHeaderComponent={ ListHeaderComponent }
            ListHeaderComponentStyle={ { flexDirection: 'row' } }
            ListEmptyComponent={ disableEmptyComponent || hideGrid ? null : ListEmptyComponent }
            scrollAnimationEnabled={ isTVGridAnimation }
          />
        </View>
      </ScrollContext.Provider>
    </FocusContext.Provider>
  );
}

export default FilmGridComponent;
