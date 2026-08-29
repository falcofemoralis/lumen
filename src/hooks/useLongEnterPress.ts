import { useEffect, useRef } from 'react';
import RemoteControlManager from 'Util/RemoteControl/RemoteControlManager';
import { SupportedKeys } from 'Util/RemoteControl/SupportedKeys';

/**
 * Calls `onLongPress` when the user holds the d-pad OK/Enter button while this
 * node is focused -- the remote equivalent of `Pressable`'s `onLongPress`
 * (which only fires for air-mouse/touch presses).
 *
 * `RemoteControlManager` already does the press-duration bookkeeping: it emits
 * LONG_ENTER once the button has been held past the long-press threshold, and
 * in that case it deliberately does NOT emit a plain ENTER on key up. So a
 * long press never also triggers `onPress`/`onEnterPress`.
 *
 * Keep `enabled` tied to the node's focused state: every mounted pressable
 * would otherwise fire on any long press, wherever the focus actually is.
 */
export function useLongEnterPress(onLongPress?: () => void, enabled = true) {
  const onLongPressRef = useRef(onLongPress);

  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);

  // Subscribe on the handler's presence rather than its identity, so inline
  // arrow props don't re-register the listener on every render.
  const hasHandler = !!onLongPress;

  useEffect(() => {
    if (!enabled || !hasHandler) {
      return () => {};
    }

    const listener = RemoteControlManager.addKeydownListener((key) => {
      if (key !== SupportedKeys.LONG_ENTER) {
        return false;
      }

      onLongPressRef.current?.();

      // Consumed -- nothing else should react to this long press.
      return true;
    });

    return () => {
      RemoteControlManager.removeKeydownListener(listener);
    };
  }, [enabled, hasHandler]);
}

export default useLongEnterPress;
