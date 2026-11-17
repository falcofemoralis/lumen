import { createContext, RefObject, useCallback, useContext, useLayoutEffect, useRef } from 'react';
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const RetainedScrollContext = createContext<boolean | null>(null);
type ScrollHandle = { scrollToOffset: (options: { offset: number; animated: boolean }) => void };

/** Opt-in for pager pages whose hidden viewport can reset the native scroll offset. */
export function useRetainedScroll(list: RefObject<ScrollHandle | null>) {
  const active = useContext(RetainedScrollContext);
  const offset = useRef(0);
  const restoring = useRef(false);
  const frame = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);
  const restore = useCallback(() => {
    if (!active) return;
    cancel();
    restoring.current = true;
    frame.current = requestAnimationFrame(() => {
      list.current?.scrollToOffset({ offset: offset.current, animated: false });
    });
    // Restore once more after the detached screen and its focus have settled.
    timer.current = setTimeout(() => {
      list.current?.scrollToOffset({ offset: offset.current, animated: false });
      restoring.current = false;
    }, 200);
  }, [active, cancel, list]);
  useLayoutEffect(() => {
    restore();

    return cancel;
  }, [restore, cancel]);
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (active && !restoring.current && event.nativeEvent.layoutMeasurement.height > 0) {
      offset.current = Math.max(0, event.nativeEvent.contentOffset.y);
    }
  }, [active]);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    if (event.nativeEvent.layout.height > 0) restore();
  }, [restore]);

  return { enabled: active !== null, onScroll, onLayout };
}