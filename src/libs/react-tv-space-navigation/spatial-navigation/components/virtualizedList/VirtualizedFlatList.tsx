import { useEffect, useRef } from "react";
import { FlatList, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { typedMemo } from "../../helpers/TypedMemo";
import { NodeOrientation } from "../../types/orientation";

export type ScrollBehavior =
  | "stick-to-start"
  | "stick-to-end"
  | "jump-on-scroll"
  | "stick-to-center";
export interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (args: { item: T; index: number }) => JSX.Element;
  /** If vertical the height of an item, otherwise the width */
  itemSize: number | ((item: T) => number);
  currentlyFocusedItemIndex: number;
  ListHeaderComponent?: React.ReactNode;
  ListEmptyComponent?: React.ReactNode;
  /**
   * How many items are RENDERED ADDITIONALLY to the minimum amount possible. It impacts virtualization size.
   * Defaults to 2.
   *
   * Should be a POSITIVE number.
   *
   * Minimal amount possible is 2N + 1 for jump-on-scroll, and N + 2 for the other behaviours, N being the number
   * of visible elements on the screen.
   *
   * By default, you will then have N + 2 + 2 elements rendered for stick-to-* behaviours.
   */
  additionalItemsRendered?: number;
  onEndReached?: () => void;
  /** Number of items left to display before triggering onEndReached */
  onEndReachedThresholdItemsNumber?: number;
  style?: StyleProp<ViewStyle>;
  orientation?: NodeOrientation;
  /**
   * @deprecated
   * Use a custom key instead of the recycling.
   * */
  keyExtractor?: (index: number) => string;
  /** Total number of expected items for infinite scroll (helps aligning items) used for pagination */
  nbMaxOfItems?: number;
  /** Duration of a scrolling animation inside the VirtualizedList */
  scrollDuration?: number;
  /** The size of the list in its scrollable axis */
  listSizeInPx: number;
  scrollBehavior?: ScrollBehavior;
  testID?: string;
  paddingBottom?: number;
}

/**
 * DO NOT use this component directly !
 * You should use the component SpatialNavigationVirtualizedList.tsx to render navigable lists of components.
 *
 * Why this has been made:
 *   - it gives us full control on the way we scroll (using CSS animations)
 *   - it is way more performant than a FlatList
 */
export const VirtualizedFlatList = typedMemo(
  <T,>({
    data,
    renderItem,
    itemSize,
    currentlyFocusedItemIndex,
    additionalItemsRendered = 2,
    onEndReached,
    onEndReachedThresholdItemsNumber = 3,
    style,
    orientation = "horizontal",
    nbMaxOfItems,
    keyExtractor,
    scrollDuration = 200,
    listSizeInPx,
    scrollBehavior = "stick-to-start",
    testID,
    ListHeaderComponent,
    ListEmptyComponent,
    paddingBottom = 0,
  }: VirtualizedListProps<T>) => {
    const listRef = useRef<FlatList<any>>(null);

    useEffect(() => {
      if (currentlyFocusedItemIndex === 0) {
        listRef.current?.scrollToOffset({
          offset: 0,
          animated: scrollDuration > 0,
        });
        return;
      }

      listRef.current?.scrollToIndex({
        index: currentlyFocusedItemIndex,
        animated: scrollDuration > 0,
        viewPosition: 0,
      });
    }, [currentlyFocusedItemIndex, scrollDuration]);

    return (
      <FlatList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => `row-${index}`}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.75}
        style={[{ height: "100%" }, style]}
        contentContainerStyle={{
          paddingBottom
        }}
        removeClippedSubviews
        scrollEnabled={false}
        ListHeaderComponent={ ListHeaderComponent }
        ListEmptyComponent={ ListEmptyComponent }
      />
    );
  },
);
VirtualizedFlatList.displayName = "VirtualizedFlatList";
