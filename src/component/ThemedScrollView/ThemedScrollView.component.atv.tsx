import { FocusableComponentLayout } from '@noriginmedia/norigin-spatial-navigation-core';
import { FocusContext, FocusHandler, useFocusable } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { useDefaultFocus } from 'Hooks/useDefaultFocus';
import { useCallback, useRef } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { ScrollContext, useScrollContext } from './ScrollContext';
import { ThemedScrollViewComponentProps } from './ThemedScrollView.type';

export const ThemedScrollViewComponent = ({
  children,
  horizontal,
  style,
  containerStyle,
  contentContainerStyle,
  autofocus,
  preferredChildFocusKey,
  viewPosition = 0.5,
}: ThemedScrollViewComponentProps) => {
  const { scrollTo: scrollParentToSelf } = useScrollContext();

  const { ref, focusKey } = useFocusable<object, View>({
    onFocus: scrollParentToSelf,
    preferredChildFocusKey,
  });

  const scrollRef = useRef<ScrollView>(null);
  const viewportSizeRef = useRef(0);
  const contentSizeRef = useRef(0);
  const offsetRef = useRef(0);
  /**
   * Offset the last programmatic scroll is heading to, or null once it landed.
   * An animated scroll reports intermediate offsets, so while one is running
   * visibility has to be judged against the destination -- otherwise holding a
   * direction key queues a second scroll for a child that is already on its way
   * into view.
   */
  const targetOffsetRef = useRef<number | null>(null);

  // Claim focus when the enclosing screen loads or is returned to -- not only on
  // mount, so autofocus survives navigating back to this screen.
  useDefaultFocus(focusKey, !!autofocus);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;

    viewportSizeRef.current = horizontal ? width : height;
  }, [horizontal]);

  const handleContentSizeChange = useCallback((width: number, height: number) => {
    contentSizeRef.current = horizontal ? width : height;
  }, [horizontal]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { x, y } = event.nativeEvent.contentOffset;

    offsetRef.current = horizontal ? x : y;

    if (targetOffsetRef.current !== null && Math.abs(offsetRef.current - targetOffsetRef.current) < 1) {
      targetOffsetRef.current = null;
    }
  }, [horizontal]);

  const scrollToOffset = useCallback((value: number) => {
    const maxOffset = contentSizeRef.current > 0
      ? Math.max(0, contentSizeRef.current - viewportSizeRef.current)
      : Number.MAX_SAFE_INTEGER;
    const offset = Math.min(Math.max(0, value), maxOffset);

    // Already there -- skip the scroll so a no-op does not leave a pending
    // target behind (no onScroll would fire to clear it).
    if (Math.abs(offset - offsetRef.current) < 1) {
      targetOffsetRef.current = null;

      return;
    }

    targetOffsetRef.current = offset;

    scrollRef.current?.scrollTo(
      horizontal
        ? { x: offset, animated: true }
        : { y: offset, animated: true }
    );
  }, [horizontal]);

  const scrollTo: FocusHandler = useCallback((layout: FocusableComponentLayout) => {
    const content = ref.current;
    const child = layout.node as unknown as View | null;

    if (!content || !child) {
      return;
    }

    /**
     * layout.x/y are window coordinates (node.measure pageX/pageY), so they
     * include the sidebar offset and the current scroll position. Measure the
     * child against the content view instead to get its stable offset inside
     * the ScrollView.
     */
    child.measureLayout(content, (x, y, width, height) => {
      const gap = (StyleSheet.flatten(style) as { gap?: number })?.gap ?? 0;
      // The gap is padding around the child that should stay visible with it.
      const childStart = (horizontal ? x : y) - gap;
      const childEnd = (horizontal ? x + width : y + height) + gap;
      const viewportSize = viewportSizeRef.current;

      // No layout pass yet, so there is nothing to test visibility against --
      // fall back to aligning the child with the start of the ScrollView.
      if (viewportSize <= 0) {
        scrollToOffset(childStart);

        return;
      }

      /**
       * A fixed alignment is followed on every focus change, even when the
       * child is already visible -- the point of, say, 0.5 is to keep focus in
       * the middle so the neighbours that can be focused next stay on screen.
       * scrollToOffset clamps to the content bounds, so children near the ends
       * simply stop travelling once the list runs out.
       */
      if (viewPosition !== undefined) {
        scrollToOffset(childStart - viewPosition * (viewportSize - (childEnd - childStart)));

        return;
      }

      const currentOffset = targetOffsetRef.current ?? offsetRef.current;

      // Already fully on screen -- leave the scroll position alone.
      if (childStart >= currentOffset && childEnd <= currentOffset + viewportSize) {
        return;
      }

      // Nudge the child to whichever edge it fell off of, so it moves the
      // smallest distance that makes it visible.
      scrollToOffset(childStart < currentOffset ? childStart : childEnd - viewportSize);
    });
  }, [horizontal, ref, style, viewPosition, scrollToOffset]);

  return (
    <FocusContext.Provider value={ focusKey }>
      <ScrollContext.Provider value={ { scrollTo } }>
        <ScrollView
          ref={ scrollRef }
          horizontal={ horizontal }
          tvFocusable={ false }
          style={ [{ width: '100%', height: '100%' }, containerStyle] }
          contentContainerStyle={ contentContainerStyle }
          showsHorizontalScrollIndicator={ false }
          showsVerticalScrollIndicator={ false }
          scrollEventThrottle={ 16 }
          onLayout={ handleLayout }
          onContentSizeChange={ handleContentSizeChange }
          onScroll={ handleScroll }
        >
          <View ref={ ref } style={ [{ flexDirection: horizontal ? 'row' : 'column' }, style] }>
            { children }
          </View>
        </ScrollView>
      </ScrollContext.Provider>
    </FocusContext.Provider>
  );
};

export default ThemedScrollViewComponent;
