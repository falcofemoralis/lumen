import ReactNativeFocusScrollModule from './ReactNativeFocusScrollModule';

/**
 * A cubic bezier as its two control points -- `[x1, y1, x2, y2]`, the same four numbers
 * CSS takes. Time coordinates outside 0..1 are clamped natively; value coordinates are
 * free, so a curve may overshoot and settle back.
 */
export type CubicBezier = [number, number, number, number];

/**
 * Scrolling a list at a speed of the app's choosing.
 *
 * React Native's own animated scroll is a fixed 250ms with a fixed interpolator, neither
 * of which it exposes; this drives the same underlying animation -- an `ObjectAnimator` on
 * the scroll view's `scrollY` -- with a duration and easing curve handed in.
 *
 * The animation runs entirely on the UI thread, so it does not compete with whatever the
 * JS thread is doing (mounting the row being scrolled into, most of the time), and the
 * scroll events a virtualised list depends on are emitted natively as usual.
 *
 * Android only. Everywhere else {@link isSupported} is false and there is nothing here to
 * fall back from -- the caller keeps using the list's own scrolling.
 */
class ReactNativeFocusScroll {
  /**
   * Whether this build can drive a scroll at all. False on a JS bundle running against a
   * native build without the module, which is worth checking once rather than failing per
   * scroll.
   */
  get isSupported(): boolean {
    return ReactNativeFocusScrollModule !== null;
  }

  /**
   * Scrolls the view with the given tag -- a scroll view's, e.g. what FlashList's
   * `getScrollableNode()` returns -- to `offset` over `duration` ms.
   *
   * Replaces whatever scroll that view was already running, its own flings included, and
   * starts from where that had got to. Offsets past the end of the content settle at the
   * end of the content.
   *
   * Resolves to `false` when the tag resolves to no view, which is the caller's cue to
   * scroll the list some other way rather than to wait for a scroll that will not happen.
   */
  scrollTo(viewTag: number, offset: number, duration: number, easing: CubicBezier): Promise<boolean> {
    if (!ReactNativeFocusScrollModule) {
      return Promise.resolve(false);
    }

    return ReactNativeFocusScrollModule.scrollTo(viewTag, offset, duration, easing);
  }
}

export const reactNativeFocusScroll = new ReactNativeFocusScroll();
