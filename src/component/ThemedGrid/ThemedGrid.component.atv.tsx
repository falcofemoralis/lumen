import { setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { ScrollContext } from 'Component/ThemedScrollView/ScrollContext';
import { useDefaultFocus } from 'Hooks/useDefaultFocus';
import { FOCUS_SCROLL_EVENT_THROTTLE, useFocusScroll } from 'Hooks/useFocusScroll';
import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

import { ThemedGridComponentProps, ThemedGridRowProps } from './ThemedGrid.type';

// Frames to wait for cell 0 to re-enter FlashList's render window after BACK
// scrolls the grid back to the top.
const MAX_FIRST_CELL_ATTEMPTS = 20;

type RegisterCell = (index: number, focusKey: string) => () => void;

type GridCellProps = {
  index: number;
  gap: number;
  registerCell: RegisterCell;
  scrollToIndex: (index: number) => void;
  children: ReactNode;
};

// Wraps each consumer-rendered cell (already a Norigin focusable such as
// ThemedPressable/ThemedButton) in:
//  - a Norigin node, so the grid can restore the last focused child on return.
//  - a per-index ScrollContext, so the focused cell scrolls itself into view
//    (the inner focusable calls scrollTo on focus).
//
// The focus key MUST stay auto-generated (never derived from `index`): FlashList
// recycles this component instance across data indices, and Norigin registers a
// node once on mount and never re-keys it. An index-derived key would leave the
// registry holding the index this cell had when it first mounted, so recycled
// cells collide on the same key and their unmount deletes another live cell's
// entry -- rows silently drop out of spatial navigation. `registerCell` keeps
// the index -> live focus key mapping instead, updated on every recycle.
function GridCell({ index, gap, registerCell, scrollToIndex, children }: GridCellProps) {
  const { ref, focusKey } = useFocusable<object, View>();

  useEffect(() => registerCell(index, focusKey), [index, focusKey, registerCell]);

  const scrollTo = useCallback(() => scrollToIndex(index), [index, scrollToIndex]);
  const scrollValue = useMemo(() => ({ scrollTo }), [scrollTo]);

  // FlashList's numColumns has no built-in grid gap; half-gap padding on every
  // cell reproduces the spacing the old rowContainerStyle gap provided.
  const cellStyle = useMemo(() => (gap ? { padding: gap / 2 } : undefined), [gap]);

  return (
    <FocusContext.Provider value={ focusKey }>
      <ScrollContext.Provider value={ scrollValue }>
        <View ref={ ref } style={ cellStyle } tvFocusable={ false }>
          { children }
        </View>
      </ScrollContext.Provider>
    </FocusContext.Provider>
  );
}

const MemoizedGridCell = memo(GridCell);

export const ThemedGridComponent = ({
  data,
  numberOfColumns,
  style,
  rowStyle,
  scrollBehavior = 'stick-to-start',
  autofocus = false,
  ListHeaderComponent,
  ListEmptyComponent,
  renderItem,
  handleScrollEnd,
}: ThemedGridComponentProps) => {
  const listRef = useRef<FlashListRef<any>>(null);
  const lastRowRef = useRef(-1);

  // Live index -> focus key map of the cells FlashList currently has mounted.
  // Rebuilt continuously as cells are recycled, so it always points at the node
  // that actually renders a given index.
  const cellKeysRef = useRef(new Map<number, string>());
  const [hasCells, setHasCells] = useState(false);

  const registerCell = useCallback<RegisterCell>((index, cellFocusKey) => {
    cellKeysRef.current.set(index, cellFocusKey);
    setHasCells(true);

    return () => {
      // Only drop the entry if it is still ours: on recycle React runs this
      // cleanup after the cell that took over the index has already claimed it.
      if (cellKeysRef.current.get(index) === cellFocusKey) {
        cellKeysRef.current.delete(index);
      }
    };
  }, []);

  const { ref, focusKey } = useFocusable<object, View>({
    saveLastFocusedChild: true,
  });

  // Focus the grid (restoring the last focused cell via saveLastFocusedChild)
  // when the screen loads or is returned to. Replaces the old <DefaultFocus>
  // wrapper; gated on a cell actually being registered -- FlashList needs its
  // container layout before it renders any item, so on the first commit the grid
  // is still childless and Norigin would resolve the claim to the grid container
  // itself, silently consuming the one claim this screen visit gets.
  useDefaultFocus(focusKey, autofocus && data.length > 0 && hasCells);

  const viewPosition = scrollBehavior === 'stick-to-center' ? 0.5 : 0;

  const gap = (StyleSheet.flatten(rowStyle) as { gap?: number } | undefined)?.gap ?? 0;

  // Focus scrolling of its own rather than the list's: FlashList can only hand
  // an animated scroll to the platform, at the platform's speed.
  const { scrollToRow } = useFocusScroll(listRef, { viewPosition });

  const scrollToIndex = useCallback((index: number) => {
    // Only scroll when the focused row changes -- moving between cells within a
    // row that is already on screen must not trigger an animated re-center.
    const row = Math.floor(index / numberOfColumns);

    if (row === lastRowRef.current) {
      return;
    }

    lastRowRef.current = row;

    scrollToRow(index);
  }, [numberOfColumns, scrollToRow]);

  // BACK jumps to the top of the grid (scroll + focus the first cell), matching
  // the previous VirtualizedList behaviour.
  useEffect(() => {
    let frame: number | null = null;

    // Cell 0 is usually recycled away when scrolled down, so it only registers
    // once the scroll brings it back into the render window -- retry across a
    // short window instead of focusing nothing.
    const focusFirstCell = (attempt = 0) => {
      const firstCellKey = cellKeysRef.current.get(0);

      if (firstCellKey) {
        setFocus(firstCellKey);

        return;
      }

      if (attempt < MAX_FIRST_CELL_ATTEMPTS) {
        frame = requestAnimationFrame(() => focusFirstCell(attempt + 1));
      }
    };

    const keyDownListener = (type: SupportedKeys) => {
      if (type === SupportedKeys.BACKWARD) {
        lastRowRef.current = -1;
        // Where focusing the first cell would scroll to anyway, so the scroll
        // and the focus that follows it a few frames later agree.
        scrollToRow(0);
        focusFirstCell();

        return true;
      }

      return false;
    };

    const listener = RemoteControlManager.addKeydownListener(keyDownListener);

    return () => {
      RemoteControlManager.removeKeydownListener(listener);

      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [scrollToRow]);

  const renderCell = useCallback(({ item, index }: { item: any; index: number }) => (
    <MemoizedGridCell
      index={ index }
      gap={ gap }
      registerCell={ registerCell }
      scrollToIndex={ scrollToIndex }
    >
      { renderItem({ item, index } as ThemedGridRowProps) }
    </MemoizedGridCell>
  ), [gap, registerCell, scrollToIndex, renderItem]);

  return (
    <FocusContext.Provider value={ focusKey }>
      <View ref={ ref } style={ { flex: 1 } } tvFocusable={ false }>
        <FlashList
          ref={ listRef }
          data={ data }
          renderItem={ renderCell }
          numColumns={ numberOfColumns }
          scrollEventThrottle={ FOCUS_SCROLL_EVENT_THROTTLE }
          onEndReached={ handleScrollEnd }
          onEndReachedThreshold={ 0.25 }
          ListHeaderComponent={ ListHeaderComponent }
          ListEmptyComponent={ ListEmptyComponent }
          contentContainerStyle={ StyleSheet.flatten(style) }
          showsVerticalScrollIndicator={ false }
        />
      </View>
    </FocusContext.Provider>
  );
};

export default ThemedGridComponent;
