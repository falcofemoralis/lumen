import type { AddEventListenersOptions, Key } from '@noriginmedia/norigin-spatial-navigation-core';
import { ReactNativeLayoutAdapter } from '@noriginmedia/norigin-spatial-navigation-react-native-tvos';

import RemoteControlManager from './RemoteControlManager';
import { SupportedKeys } from './SupportedKeys';

/**
 * Custom Android TV layout adapter that feeds spatial navigation from
 * `RemoteControlManager` (react-native-keyevent) instead of the built-in
 * `TVEventHandler`. This reuses the same keycode-handling approach that the
 * old `configureRemoteControl` used, so the rest of the app keeps getting its
 * keys from a single source.
 *
 * Layout/native-focus logic (measureLayout / focusNode / blurNode) is inherited
 * unchanged from the base adapter — only the event source is swapped out.
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
}

export default RemoteControlLayoutAdapter;
