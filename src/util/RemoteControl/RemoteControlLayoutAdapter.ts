import type { AddEventListenersOptions, Key } from '@noriginmedia/norigin-spatial-navigation-core';
import { ReactNativeLayoutAdapter } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';
import { trapRefGlobal } from 'Navigation/NativeFocusTrap';
import { Keyboard, Platform } from 'react-native';

import RemoteControlManager from './RemoteControlManager';
import { SupportedKeys } from './SupportedKeys';

/**
 * Custom Android TV layout adapter that feeds spatial navigation from
 * `RemoteControlManager` (react-native-keyevent) instead of the built-in
 * `TVEventHandler`. This reuses the same keycode-handling approach that the
 * old `configureRemoteControl` used, so the rest of the app keeps getting its
 * keys from a single source.
 *
 * `measureLayout` / `blurNode` are inherited unchanged; `focusNode` is replaced
 * (see below) so the virtual cursor never drags the native focus along.
 *
 * norigin only understands the five spatial keys below. LONG_ENTER / BACK /
 * BACKWARD are emitted by RemoteControlManager but consumed per-component
 * (Player, PlayerProgressBar, etc.), so they are intentionally ignored here.
 */
const KEY_MAP: Partial<Record<SupportedKeys, Key>> = {
  [SupportedKeys.LEFT]: 'left',
  [SupportedKeys.RIGHT]: 'right',
  [SupportedKeys.UP]: 'up',
  [SupportedKeys.DOWN]: 'down',
  [SupportedKeys.ENTER]: 'enter',
};

export class RemoteControlLayoutAdapter extends ReactNativeLayoutAdapter {
  private keyDownListener?: (event: SupportedKeys) => boolean;

  addEventListeners = ({ keyDown }: AddEventListenersOptions): void => {
    // Registers the native KeyEvent listeners (idempotent — re-registers the
    // same handler). Every other RemoteControlManager consumer relies on this.
    RemoteControlManager.subscribe();

    this.keyDownListener = RemoteControlManager.addKeydownListener((key) => {
      const mapped = KEY_MAP[key];

      if (mapped) {
        // Native has no DOM Event; the built-in adapter passes null as well.
        keyDown?.(mapped, null as unknown as Event);
      }

      return false;
    });
  };

  removeEventListeners = (): void => {
    // Only drop our own listener — RemoteControlManager stays subscribed
    // because it is shared with the rest of the app.
    if (this.keyDownListener) {
      RemoteControlManager.removeKeydownListener(this.keyDownListener);
      this.keyDownListener = undefined;
    }
  };

  /**
   * The base adapter mirrors every focus change onto the native focus engine
   * with `node.requestTVFocus()`. On Android that is a liability rather than a
   * sync: a plain `View` is not natively focusable, so `requestFocus` falls
   * through to the first focusable descendant (`FOCUS_BEFORE_DESCENDANTS`) —
   * an RNGH button, which is natively focusable no matter what we pass it. Real
   * focus then sits on a button instead of the trap, and from there the native
   * focus engine moves it on its own and drags ScrollViews along.
   *
   * Nothing in the app reads native focus, so instead of following the virtual
   * cursor we park focus back on the trap. The layout bookkeeping the base does
   * here feeds its own `TVEventHandler` pan handling, which `addEventListeners`
   * above already replaced — so there is nothing left to keep in sync.
   *
   * The keyboard check is kept from the base: while the IME is up the EditText
   * legitimately owns native focus and must not be interrupted mid-typing.
   */
  focusNode = (): void => {
    if (Platform.isTV && !Keyboard.isVisible()) {
      trapRefGlobal.current?.requestTVFocus();
    }
  };
}

export default RemoteControlLayoutAdapter;
