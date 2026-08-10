import { NextFocusResolver } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, FocusHandler, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { FilmCard } from 'Component/FilmCard';
import { POSTER_ASPECT_HEIGHT, POSTER_ASPECT_WIDTH } from 'Component/FilmCard/FilmCard.config';
import { INFO_HEIGHT } from 'Component/FilmCard/FilmCard.style.atv';
import { FilmCardThumbnail } from 'Component/FilmCard/FilmCard.thumbnail.atv';
import { ScrollContext, useScrollContext } from 'Component/ThemedScrollView/ScrollContext';
import { ThemedText } from 'Component/ThemedText';
import { useConfigContext } from 'Context/ConfigContext';
import { useDefaultFocus } from 'Hooks/useDefaultFocus';
import { useLatest } from 'Hooks/useLatest';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native-gesture-handler';
import { useAppTheme } from 'Theme/context';
import { ThemedStyles } from 'Theme/types';

import { DRAW_DISTANCE_ROWS_TV, PRELOAD_ROWS_TV } from './FilmGrid.config';
import { componentStyles, FOCUS_OVERFLOW_GAP, ROW_GAP } from './FilmGrid.style.atv';
import {
  FilmGridCardHandle,
  FilmGridComponentProps,
  FilmGridFilmItem,
  FilmGridHeaderProps,
  FilmGridItem,
  FilmGridItemProps,
  FilmGridItemType,
  RegisterCard,
} from './FilmGrid.type';

type Styles = ThemedStyles<typeof componentStyles>;

type FilmGridExtraProps = {
  item: FilmGridFilmItem
}

const FilmGridHeader = ({
  header,
  styles,
}: FilmGridHeaderProps & { styles: Styles }) => (
  <View style={ styles.header }>
    <ThemedText style={ styles.headerText }>
      { header }
    </ThemedText>
  </View>
);

function FilmGridItemCard({
  item,
  isLastRow,
  registerCard,
  handleOnPress,
}: FilmGridItemProps) {
  const { scale } = useAppTheme();
  const { scrollTo } = useScrollContext();

  const onPress = useCallback(() => {
    const { isPlaceholder, film } = item;

    if (isPlaceholder) {
      return;
    }

    handleOnPress(film);
  }, [item, handleOnPress]);

  // Norigin re-registers the focusable -- and invalidates its cached layout,
  // which costs a native measure on the next key press -- whenever any of these
  // change identity, so hand it stable references rather than fresh ones.
  const extraProps = useMemo(() => ({ item }), [item]);

  const { ref, focused, focusKey } = useFocusable<FilmGridExtraProps>({
    // Loading placeholders must not be focusable: focusing one and then having
    // it swapped for the real film (different key -> unmount) makes Norigin
    // auto-restore focus, yanking the user back up.
    focusable: !item.isPlaceholder,
    onFocus: scrollTo,
    extraProps,
    onEnterPress: onPress,
  });

  /**
   * Whether this card's next zoom snaps instead of gliding. The grid sets it on
   * the way into a move, so it is already in place by the time `focused` flips
   * and the transition would otherwise start.
   */
  const [isInstantZoom, setIsInstantZoom] = useState(false);

  // Norigin only hands the resolver a focus key, so the grid needs a way back
  // from that key to the card's place in the data -- and to the card itself.
  // Registering on mount keeps the mapping in step with recycling.
  useEffect(
    () => registerCard?.(focusKey, { item, setInstantZoom: setIsInstantZoom }),
    [registerCard, item, focusKey]
  );

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
    const { isPlaceholder, film } = item;

    if (isPlaceholder) {
      return <FilmCardThumbnail />;
    }

    return (
      <FilmCard
        filmCard={ film }
        isFocused={ focused }
        disableScaleTransition={ isInstantZoom }
      />
    );
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

const MemoizedHeader = memo(FilmGridHeader);
const MemoizedGridItem = memo(FilmGridItemCard);

// Where a focused row is parked vertically: just below the top edge, leaving the
// row above it visible as a hint that there is more up there.
const FOCUSED_ROW_VIEW_POSITION = 0.05;

export function FilmGridComponent({
  data,
  hasFilms,
  isSectioned,
  numberOfColumns,
  disableEmptyComponent,
  hideGrid,
  ListHeaderComponent,
  ListEmptyComponent,
  centerEmptyComponent,
  disableAutofocus,
  handleOnPress,
  handleScrollEnd,
  onAtTopChange,
}: FilmGridComponentProps) {
  const styles = useThemedStyles(componentStyles);
  const { scale, theme: { dimensions } } = useAppTheme();
  // An animated scroll runs over several frames while the row being entered is
  // still mounting its cards and the focus engine is measuring them; on weak
  // hardware the two compete and the move feels sluggish, so low mode jumps.
  const { isLowMode } = useConfigContext();
  const isScrollAnimated = !isLowMode;

  const listRef = useRef<FlashListRef<FilmGridItem>>(null);
  const lastIndexRef = useRef(-1);
  // Whether the focused row sits in the preload zone at the end of the grid --
  // where a scroll to it gets clamped for want of rows below it.
  const isNearEndRef = useRef(false);

  /**
   * The grid laid out as rows of item keys, so a neighbour can be looked up by
   * position. Rebuilt only when the data changes, not per key press.
   */
  const rows = useMemo(() => {
    const grid: string[][] = [];

    data.forEach((item) => {
      if (item.type !== FilmGridItemType.FILM) {
        return;
      }

      (grid[item.row] ??= [])[item.column] = item.key;
    });

    return grid;
  }, [data]);

  const getRows = useLatest(rows);
  const getIsLowMode = useLatest(isLowMode);

  // Both directions of the mounted cards' focus-key mapping: the resolver is
  // handed a focus key and has to answer with one.
  const cardByFocusKeyRef = useRef(new Map<string, FilmGridCardHandle>());
  const focusKeyByItemKeyRef = useRef(new Map<string, string>());

  const registerCard = useCallback<RegisterCard>((cardFocusKey, handle) => {
    cardByFocusKeyRef.current.set(cardFocusKey, handle);
    focusKeyByItemKeyRef.current.set(handle.item.key, cardFocusKey);

    return () => {
      cardByFocusKeyRef.current.delete(cardFocusKey);

      // Only drop the entry if it is still ours: on recycle React runs this
      // cleanup after the card that took over the item has already claimed it.
      if (focusKeyByItemKeyRef.current.get(handle.item.key) === cardFocusKey) {
        focusKeyByItemKeyRef.current.delete(handle.item.key);
      }
    };
  }, []);

  /**
   * Answers "what gets focus next" from the grid's own geometry.
   *
   * Norigin's default resolution measures every mounted sibling on every key
   * press -- its cached layouts go stale after 16ms -- which on a full grid is
   * dozens of native measure calls before focus can move at all, and is what
   * made row changes feel laggy on weak hardware. A uniform grid needs no
   * geometry: the neighbour is one step along the row or column. Returning an
   * answer here is what lets `measureChildrenLayout: false` be safe.
   *
   * `null` means "nothing this way", which Norigin handles by bubbling up to the
   * parent -- the existing behaviour at the grid's edges, e.g. leaving the top
   * row hands focus to the pager menu.
   *
   * It is also the one place that knows both the direction and which card is
   * about to be focused, so it doubles as the hook for the focus zoom: a row
   * change draws a new row, which is when the zoom's 250ms transform is worth
   * dropping, while moving along a row draws nothing and can afford it.
   */
  const resolveNextFocus = useCallback<NextFocusResolver>((direction, currentFocusKey, siblings) => {
    const currentCard = cardByFocusKeyRef.current.get(currentFocusKey);

    if (!currentCard) {
      return null;
    }

    const { item: current } = currentCard;
    const isVertical = direction === 'up' || direction === 'down';
    const targetRow = isVertical ? current.row + (direction === 'down' ? 1 : -1) : current.row;
    const targetRowKeys = getRows()[targetRow];

    if (!targetRowKeys) {
      return null;
    }

    // A section's last row can be short, so a vertical move steps to the nearest
    // column that exists rather than falling out of the grid. Horizontal moves
    // must not clamp -- running off the end of a row is a real edge.
    const targetColumn = isVertical
      ? Math.min(current.column, targetRowKeys.length - 1)
      : current.column + (direction === 'right' ? 1 : -1);
    const targetKey = targetRowKeys[targetColumn];

    if (targetKey === undefined) {
      return null;
    }

    const targetFocusKey = focusKeyByItemKeyRef.current.get(targetKey);
    const next = siblings.find((sibling) => sibling.focusKey === targetFocusKey);

    if (next) {
      /**
       * Both cards of the move zoom -- one down, one up -- so both need telling.
       * Setting it here rather than passing it down as a grid-wide prop is the
       * point: only these two re-render, and they were re-rendering for the
       * focus change anyway. It also lands before `focused` flips, so the
       * transition is already configured when it would otherwise start.
       */
      const isInstantZoom = getIsLowMode() && isVertical;

      currentCard.setInstantZoom(isInstantZoom);
      cardByFocusKeyRef.current.get(next.focusKey)?.setInstantZoom(isInstantZoom);

      return next;
    }

    /**
     * The neighbour exists in the data but is not drawn yet, so it cannot be
     * focused. Reporting "nothing this way" would throw focus out of the grid
     * entirely, so hold position instead and let the user press again once the
     * row is mounted. Keeping DRAW_DISTANCE_ROWS_TV at 1 or more means the
     * adjacent row is always drawn and this should not be reachable.
     */
    return siblings.find((sibling) => sibling.focusKey === currentFocusKey) ?? null;
  }, [getRows, getIsLowMode]);

  const { ref, focusKey } = useFocusable<object, View>({
    saveLastFocusedChild: true,
    // Safe only because `nextFocusResolver` answers without needing geometry.
    measureChildrenLayout: false,
    nextFocusResolver: resolveNextFocus,
  });

  // FlashList draws no cells in its first render cycle -- it measures itself
  // first -- so having the films is not enough to claim focus: at that point
  // the grid holds no registered card and Norigin resolves the claim to the
  // container itself, leaving nothing focused. Wait for the first draw.
  const [isDrawn, setIsDrawn] = useState(false);

  const handleLoad = useCallback(() => setIsDrawn(true), []);

  // Focus the grid (restoring the last focused card via saveLastFocusedChild)
  // whenever the screen loads or is returned to. Enabled only once real films
  // are drawn -- `data` is never empty (it holds loading placeholders meanwhile)
  // and Norigin cannot focus a card that is not registered as focusable yet.
  useDefaultFocus(focusKey, !disableAutofocus && hasFilms && isDrawn);

  // Read at focus time rather than captured, so scrollTo -- and with it the
  // scroll context every card consumes -- keeps its identity as pages arrive.
  const getPagination = useLatest({
    length: data.length,
    numberOfColumns,
    loadNextPage: handleScrollEnd,
  });

  const scrollTo: FocusHandler<FilmGridExtraProps> = useCallback((_layout, props) => {
    const index = props?.item?.scrollIndex;

    // Only scroll when the focused row changes -- every card of a row shares
    // the same scrollIndex, so moving within a visible row must not trigger an
    // animated re-center, which competes with the focus render on the JS thread
    // and feels laggy.
    if (index === undefined || index === lastIndexRef.current) {
      return;
    }

    const prevIndex = lastIndexRef.current;

    lastIndexRef.current = index;

    // Tell the pager to reveal/collapse the menu as focus crosses the first row.
    if ((prevIndex === 0) !== (index === 0)) {
      onAtTopChange?.(index === 0);
    }

    // Pull the next page in while the user is still a few rows away from the
    // end, rather than leaving it to the list's own onEndReached: focus travels
    // faster than the scroll it drives, and the scroll stops at the last row, so
    // by the time the list reports its end the user is already sitting on it.
    // Asking for a page that is already loading (or does not exist) is a no-op.
    const { length, numberOfColumns: columns, loadNextPage } = getPagination();

    isNearEndRef.current = length - index <= columns * PRELOAD_ROWS_TV;

    if (isNearEndRef.current) {
      loadNextPage?.();
    }

    // Top of the list: scroll to the absolute offset rather than to the item.
    // scrollToIndex ignores the ListHeaderComponent's height and would align the
    // first item flush to the top, scrolling the screen header (e.g. an actor's
    // main data) off -- scrollToOffset(0) keeps it in view.
    if (index === 0) {
      listRef.current?.scrollToOffset({ offset: 0, animated: isScrollAnimated });

      return;
    }

    listRef.current?.scrollToIndex({
      index,
      animated: isScrollAnimated,
      viewPosition: FOCUSED_ROW_VIEW_POSITION,
    });
  }, [onAtTopChange, getPagination, isScrollAnimated]);

  const scrollContextValue = useMemo(() => ({ scrollTo }), [scrollTo]);

  // A row focused near the end cannot be pulled up to its usual position -- the
  // list has nothing below it left to scroll -- so it stays wherever the clamped
  // scroll left it, typically at the very bottom of the screen. Once the page
  // that was loading adds rows underneath, put the focused row back where a
  // focused row belongs instead of leaving the user reading from the bottom
  // edge. Re-aligning an already aligned row is a no-op, so this only ever moves
  // the list when the scroll really was clamped.
  const prevLengthRef = useRef(data.length);

  useEffect(() => {
    const prevLength = prevLengthRef.current;

    prevLengthRef.current = data.length;

    if (data.length <= prevLength || !isNearEndRef.current || lastIndexRef.current <= 0) {
      return;
    }

    listRef.current?.scrollToIndex({
      index: lastIndexRef.current,
      animated: isScrollAnimated,
      viewPosition: FOCUSED_ROW_VIEW_POSITION,
    });
  }, [data.length, isScrollAnimated]);

  // Start of the last -- possibly partly filled -- row: every card of that row
  // shares its scrollIndex.
  const lastItem = data[data.length - 1];
  const lastRowIndex = lastItem?.type === FilmGridItemType.FILM ? lastItem.scrollIndex : -1;

  const renderItem = useCallback(({ item }: { item: FilmGridItem }) => {
    if (item.type === FilmGridItemType.HEADER) {
      return (
        <MemoizedHeader
          header={ item.header }
          styles={ styles }
        />
      );
    }

    return (
      <MemoizedGridItem
        item={ item }
        isLastRow={ item.scrollIndex === lastRowIndex }
        registerCard={ registerCard }
        handleOnPress={ handleOnPress }
      />
    );
  }, [styles, handleOnPress, lastRowIndex, registerCard]);

  // Headers and cards differ wildly in height, so recycle them separately --
  // and so do real cards and their loading placeholders.
  const getItemType = useCallback((item: FilmGridItem) => {
    if (item.type !== FilmGridItemType.FILM) {
      return item.type;
    }

    return item.isPlaceholder ? 'placeholder' : FilmGridItemType.FILM;
  }, []);

  // Cards take one grid column; a header takes the whole width, which also
  // pushes the next section onto a fresh row.
  const overrideItemLayout = useCallback((
    layout: { span?: number },
    item: FilmGridItem
  ) => {
    layout.span = item.type === FilmGridItemType.HEADER ? numberOfColumns : 1;
  }, [numberOfColumns]);

  const keyExtractor = useCallback((item: FilmGridItem) => item.key, []);

  const contentContainerStyle = useMemo(() => ({
    paddingHorizontal: scale(ROW_GAP),
    // Section headers bring the vertical rhythm of their own.
    paddingVertical: isSectioned ? 0 : scale(ROW_GAP),
    ...(centerEmptyComponent && !data.length ? styles.centeredEmpty : {}),
  }), [scale, isSectioned, centerEmptyComponent, data.length, styles]);

  const ItemSeparator = useCallback(() => (
    <View style={ { height: scale(ROW_GAP) } } />
  ), [scale]);

  // FlashList mounts cells within `drawDistance` pixels of the viewport, and its
  // default barely covers one row -- so entering a row meant mounting it first,
  // which a slow device shows as a lag between the key press and the focus
  // moving. Keep whole rows ready ahead instead; how tall a row is depends on
  // the column count, which is a user setting.
  const drawDistance = useMemo(() => {
    const cardWidth = (dimensions.width - scale(ROW_GAP) * 2) / numberOfColumns - scale(ROW_GAP);
    const posterHeight = cardWidth * (POSTER_ASPECT_HEIGHT / POSTER_ASPECT_WIDTH);
    const rowHeight = posterHeight + scale(INFO_HEIGHT) + scale(ROW_GAP);

    return Math.round(rowHeight * DRAW_DISTANCE_ROWS_TV);
  }, [dimensions.width, scale, numberOfColumns]);

  return (
    <FocusContext.Provider value={ focusKey }>
      <ScrollContext.Provider value={ scrollContextValue }>
        <View ref={ ref } style={ styles.grid } tvFocusable={ false }>
          <FlashList
            ref={ listRef }
            data={ data }
            renderItem={ renderItem }
            keyExtractor={ keyExtractor }
            getItemType={ getItemType }
            onLoad={ handleLoad }
            onEndReached={ handleScrollEnd }
            onEndReachedThreshold={ 0.5 }
            drawDistance={ drawDistance }
            numColumns={ numberOfColumns }
            overrideItemLayout={ overrideItemLayout }
            scrollEnabled={ true }
            contentContainerStyle={ contentContainerStyle }
            ItemSeparatorComponent={ ItemSeparator }
            ListHeaderComponent={ ListHeaderComponent }
            ListEmptyComponent={ disableEmptyComponent || hideGrid ? null : ListEmptyComponent }
            showsVerticalScrollIndicator={ false }
          />
        </View>
      </ScrollContext.Provider>
    </FocusContext.Provider>
  );
}

export default FilmGridComponent;
