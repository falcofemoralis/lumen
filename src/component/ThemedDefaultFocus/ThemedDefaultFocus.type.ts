export interface ThemedDefaultFocusProps {
  /**
   * Focus target. Usually a container focusKey that has `saveLastFocusedChild`,
   * so returning to the screen restores the previously focused child; can also
   * be a specific item's focusKey.
   */
  focusKey: string;
  /**
   * Active only while `true`. Enable it once the target is mounted and ready to
   * receive focus (e.g. after data has loaded), and use it to elect a single
   * default target per screen (menu vs. grid). Defaults to `true`.
   */
  enabled?: boolean;
}
