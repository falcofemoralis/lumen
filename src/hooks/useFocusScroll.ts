import { FlashListRef } from '@shopify/flash-list';
import { RefObject, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import Animated, {
  Easing,
  scrollTo,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * How long a focus-driven row change takes to glide into place, in ms.
 *
 * Keep it at or below the time it takes to press the next key: a scroll still
 * running when the next row is entered is retargeted mid-flight, which reads as
 * one continuous glide, but only while the two are of a similar length.
 */
export const FOCUS_SCROLL_DURATION = 250;

/**
 * Leaves quickly and settles slowly: the row is under the user's eye by the time
 * the animation is half done, and the tail only carries the rest of the list.
 */
export const FOCUS_SCROLL_EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

type FocusScrollParams = {
  /**
   * Where a focused row is parked in the viewport: 0 flush to the top, 0.5
   * centred, 1 flush to the bottom -- `scrollToIndex`'s `viewPosition`.
   */
  viewPosition: number;
  /**
   * Whether a row change glides or jumps. An animated scroll runs over several
   * frames while the row being entered is still mounting its cells and the focus
   * engine is measuring them; on weak hardware the two compete and the move feels
   * sluggish, so low mode passes `false` here.
   */
  isAnimated?: boolean;
};

/**
 * Scrolling a TV list by focus, at a speed of the app's choosing.
 *
 * FlashList's `animated: true` hands the move to the platform, which on Android
 * is a fixed ~250ms with a fixed interpolator and no way to ask for anything
 * else. This drives the list's scroll view directly from the UI thread instead,
 * animating the offset with Reanimated -- so duration and easing are ours.
 *
 * It dispatches the same native `scrollTo` command the list's own scrolling
 * uses, so the scroll events FlashList recycles on still arrive as usual.
 *
 * Wire all three of the returned handlers up to the list:
 *
 * ```tsx
 * <FlashList
 *   ref={ listRef }
 *   onLoad={ attachScrollRef }
 *   onScroll={ handleScroll }
 *   scrollEventThrottle={ 16 }
 * />
 * ```
 */
export function useFocusScroll<T>(
  listRef: RefObject<FlashListRef<T> | null>,
  { viewPosition, isAnimated = true }: FocusScrollParams
) {
  /**
   * The list's scroll view, held as an animated ref so the scroll can be driven
   * from the UI thread. FlashList's imperative handle is not a host component,
   * but it exposes `getNativeScrollRef`, which is what Reanimated resolves a
   * shadow node from -- see `attachScrollRef`.
   */
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  /** Where the list is scrolled to, and what the focus scroll animates. */
  const scrollOffset = useSharedValue(0);
  /** Whether that animation is the one currently moving the list. */
  const isScrolling = useSharedValue(false);

  /**
   * Meant for the list's `onLoad`: by the first draw the scroll view is mounted,
   * so this is the earliest point its host instance can be handed to the animated
   * ref. Attaching the ref to FlashList itself would resolve the same way --
   * Reanimated unwraps `getNativeScrollRef` -- but only if it is already mounted
   * by then, which is not guaranteed at the moment React attaches the list's own
   * ref.
   */
  const attachScrollRef = useCallback(() => {
    const nativeScrollRef = listRef.current?.getNativeScrollRef();

    if (nativeScrollRef) {
      scrollRef(nativeScrollRef as unknown as Animated.ScrollView);
    }
  }, [listRef, scrollRef]);

  /**
   * Where the list has to be scrolled to for `index` to sit at its focused
   * position, or `null` while the list cannot say -- before its first layout, or
   * for a row it has not measured yet.
   *
   * This is the arithmetic `scrollToIndex` does internally, done here because the
   * animation needs the destination as a number up front.
   */
  const getRowOffset = useCallback((index: number) => {
    const list = listRef.current;
    const layout = list?.getLayout(index);

    if (!list || !layout) {
      return null;
    }

    const { height: viewportHeight } = list.getWindowSize();
    // Everything above the first item -- the list header, the content padding.
    const firstItemOffset = list.getFirstItemOffset();
    const contentHeight = list.getChildContainerDimensions().height + firstItemOffset;
    const offset = layout.y - (viewportHeight - layout.height) * viewPosition + firstItemOffset;

    // The native scroll clamps itself, but the animation has to clamp too, or it
    // would run on past the end of the list and leave `scrollOffset` describing a
    // position the list is not in -- which the next row change would start from.
    return Math.min(Math.max(offset, 0), Math.max(contentHeight - viewportHeight, 0));
  }, [listRef, viewPosition]);

  const scrollToOffset = useCallback((offset: number) => {
    if (!isAnimated) {
      listRef.current?.scrollToOffset({ offset, animated: false });
      scrollOffset.value = offset;

      return;
    }

    isScrolling.value = true;
    // Deliberately animating from wherever `scrollOffset` currently is rather
    // than from the list's reported offset: on a held key the previous scroll is
    // still running, and picking up its in-flight value retargets it into one
    // continuous glide instead of restarting from a frame or two ago.
    scrollOffset.value = withTiming(offset, {
      duration: FOCUS_SCROLL_DURATION,
      easing: FOCUS_SCROLL_EASING,
    }, (finished) => {
      // An unfinished animation was replaced by the next row's, which owns the
      // scroll from here and will clear this itself.
      if (finished) {
        isScrolling.value = false;
      }
    });
  }, [listRef, isAnimated]);

  const scrollToRow = useCallback((index: number) => {
    const offset = getRowOffset(index);

    // Nothing to animate towards -- let the list find its own way there.
    if (offset === null) {
      listRef.current?.scrollToIndex({ index, animated: isAnimated, viewPosition });

      return;
    }

    scrollToOffset(offset);
  }, [listRef, getRowOffset, scrollToOffset, isAnimated, viewPosition]);

  // Touch scrolls and the list's own offset corrections move the list without
  // going through the animation, so keep its idea of the position current --
  // otherwise the next row change starts its glide from somewhere the list has
  // long left. Ignored while animating: that is where the value comes from.
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isScrolling.value) {
      return;
    }

    // Shared values are written from two callbacks here, and the immutability
    // rule only allows the first of them -- see `scrollToOffset` above.
    // eslint-disable-next-line react-hooks/immutability
    scrollOffset.value = event.nativeEvent.contentOffset.y;
  }, []);

  // The scroll itself: every frame of the animation is pushed to the scroll view
  // from the UI thread.
  useDerivedValue(() => {
    if (!isScrolling.value) {
      return;
    }

    scrollTo(scrollRef, 0, scrollOffset.value, false);
  });

  return { attachScrollRef, handleScroll, scrollToOffset, scrollToRow };
}
