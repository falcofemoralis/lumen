import { FlashListRef } from '@shopify/flash-list';
import { CubicBezier, reactNativeFocusScroll } from 'Modules/react-native-focus-scroll';
import { RefObject, useCallback, useRef } from 'react';

/**
 * How long a focus-driven row change takes to glide into place, in ms.
 *
 * Keep it at or below the time it takes to press the next key: a scroll of the
 * previous row still running when the next one is entered is called off where it
 * had got to, and a much longer scroll would spend every press being replaced
 * before it had covered any ground.
 */
export const FOCUS_SCROLL_DURATION = 250;

/**
 * The easing curve, as the two control points of a cubic bezier.
 *
 * Leaves quickly and settles slowly: the row is under the user's eye by the time
 * the animation is half done, and the tail only carries the rest of the list.
 */
export const FOCUS_SCROLL_EASING: CubicBezier = [0.25, 0.1, 0.25, 1];

/**
 * How often, in ms, the list is told where it has scrolled to.
 *
 * The animation runs on the UI thread, but every scroll event it produces is
 * answered on the JS thread: FlashList computes velocity, viewability and its
 * render window on each one, and commits a re-render whenever that window moves.
 * Left unthrottled that is ~60 rounds of it per second, landing in the same
 * frames the scroll is trying to draw -- the list only needs to keep up with the
 * scroll, not with every frame of it.
 *
 * The trade-off is staleness: Android throttles on the leading edge only and
 * emits no trailing event, so when the scroll stops the list can be up to this
 * far behind. Keep it well under the time it takes to scroll `drawDistance`
 * worth of pixels, or the buffer runs out before the list is told to refill it.
 */
export const FOCUS_SCROLL_EVENT_THROTTLE = 50;

/** Scrolls that may come back undriven before the native path is given up on. */
const MAX_DRIVER_FAILURES = 2;

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
 * FlashList's `animated: true` hands the move to the platform, which on Android is
 * a fixed ~250ms with a fixed interpolator and no way to ask for anything else, so
 * the scroll goes through `react-native-focus-scroll` instead: the same underlying
 * animation, with this file's duration and easing curve.
 *
 * Everything about it stays on the UI thread -- JS asks once per row change and is
 * out of the loop until the next one -- and the scroll events FlashList recycles on
 * are emitted natively as usual.
 *
 * Where that is not available (another platform, a native build without the module,
 * a view that cannot be resolved) the list's own scrolling takes over, permanently
 * rather than per scroll: whatever stopped it working will not stop being true.
 */
export function useFocusScroll<T>(
  listRef: RefObject<FlashListRef<T> | null>,
  { viewPosition, isAnimated = true }: FocusScrollParams
) {
  /** Set once the scrolls coming back undriven stop looking like a coincidence. */
  const isDriverBrokenRef = useRef(false);
  /** Consecutive scrolls the native side could not carry out. */
  const failedScrollsRef = useRef(0);

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

    // The native scroll clamps to the content anyway; this only keeps the number
    // handed over honest.
    const maxOffset = contentHeight - viewportHeight;

    return maxOffset > 0
      ? Math.min(Math.max(offset, 0), maxOffset)
      : Math.max(offset, 0);
  }, [listRef, viewPosition]);

  const scrollToOffset = useCallback((offset: number) => {
    const scrollTag = listRef.current?.getScrollableNode();

    if (!isAnimated
      || isDriverBrokenRef.current
      || !reactNativeFocusScroll.isSupported
      || typeof scrollTag !== 'number') {
      listRef.current?.scrollToOffset({ offset, animated: isAnimated });

      return;
    }

    reactNativeFocusScroll
      .scrollTo(scrollTag, offset, FOCUS_SCROLL_DURATION, FOCUS_SCROLL_EASING)
      .then((hasScrolled) => {
        if (hasScrolled) {
          failedScrollsRef.current = 0;

          return;
        }

        // The view behind the tag was gone by the time the scroll reached the UI
        // thread, so nothing was animated: get the user where they were going.
        // One of these is a race with a list being torn down and is no reason to
        // stop trying; a run of them is a build that cannot do this at all.
        failedScrollsRef.current += 1;
        isDriverBrokenRef.current = failedScrollsRef.current >= MAX_DRIVER_FAILURES;

        listRef.current?.scrollToOffset({ offset, animated: true });
      })
      .catch(() => {
        // A rejection is the native side saying it is not going to work, rather
        // than that it did not this time.
        isDriverBrokenRef.current = true;
        listRef.current?.scrollToOffset({ offset, animated: true });
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

  return { scrollToOffset, scrollToRow };
}
