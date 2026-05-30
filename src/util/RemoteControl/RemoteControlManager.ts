import KeyEvent from 'react-native-keyevent';
import { setTimeoutSafe } from 'Util/Misc';

import CustomEventEmitter from './CustomEventEmitter';
import { RemoteControlManagerInterface } from './RemoteControlManager.interface';
import { SupportedKeys } from './SupportedKeys';

const LONG_PRESS_DURATION = 500;

class RemoteControlManager implements RemoteControlManagerInterface {
  private eventEmitter = new CustomEventEmitter<{ keyDown: SupportedKeys, keyUp: SupportedKeys }>();

  private isEnterKeyDownPressed = false;

  private longEnterTimeout: number | null = null;

  private handleLongEnter = () => {
    this.longEnterTimeout = setTimeoutSafe(() => {
      this.eventEmitter.emit('keyDown', SupportedKeys.LONG_ENTER);
      this.longEnterTimeout = null;
    }, LONG_PRESS_DURATION);
  };

  public subscribe = () => {
    KeyEvent.onKeyDownListener(this.handleKeyDown);
    KeyEvent.onKeyUpListener(this.handleKeyUp);
  };

  private handleKeyDown = (keyEvent: { keyCode: number }) => {
    const mappedKey = {
      21: SupportedKeys.LEFT, // KEYCODE_DPAD_LEFT
      22: SupportedKeys.RIGHT, // KEYCODE_DPAD_RIGHT
      20: SupportedKeys.DOWN, // KEYCODE_DPAD_DOWN
      19: SupportedKeys.UP, // KEYCODE_DPAD_UP

      66: SupportedKeys.ENTER, // KEYCODE_ENTER
      23: SupportedKeys.ENTER, // KEYCODE_DPAD_CENTER

      67: SupportedKeys.BACKWARD, // KEYCODE_DEL (backspace/delete)
      4: SupportedKeys.BACK, // KEYCODE_BACK

      // 85: SupportedKeys.ENTER, // KEYCODE_MEDIA_PLAY_PAUSE - already implemented in the built-in player
      88: SupportedKeys.LEFT, // KEYCODE_MEDIA_PREVIOUS
      87: SupportedKeys.RIGHT, // KEYCODE_MEDIA_NEXT
    }[keyEvent.keyCode];

    if (!mappedKey) {
      return;
    }

    if (mappedKey === SupportedKeys.ENTER) {
      if (!this.isEnterKeyDownPressed) {
        this.isEnterKeyDownPressed = true;
        this.handleLongEnter();
      }

      return;
    }

    this.eventEmitter.emit('keyDown', mappedKey);
  };

  private handleKeyUp = (keyEvent: { keyCode: number }) => {
    const mappedKey = {
      21: SupportedKeys.LEFT,
      22: SupportedKeys.RIGHT,
      20: SupportedKeys.DOWN,
      19: SupportedKeys.UP,
      66: SupportedKeys.ENTER,
      23: SupportedKeys.ENTER,
      67: SupportedKeys.BACKWARD,
      // 85: SupportedKeys.ENTER,
      88: SupportedKeys.LEFT,
      87: SupportedKeys.RIGHT,
    }[keyEvent.keyCode];

    if (!mappedKey) {
      return;
    }

    if (mappedKey === SupportedKeys.ENTER) {
      this.isEnterKeyDownPressed = false;

      if (this.longEnterTimeout) {
        clearTimeout(this.longEnterTimeout);
        this.eventEmitter.emit('keyDown', mappedKey);
      }
    }

    this.eventEmitter.emit('keyUp', mappedKey);
  };

  addKeydownListener = (listener: (event: SupportedKeys) => boolean) => {
    this.eventEmitter.on('keyDown', listener);

    return listener;
  };

  removeKeydownListener = (listener: (event: SupportedKeys) => boolean) => {
    this.eventEmitter.off('keyDown', listener);
  };

  addKeyupListener = (listener: (event: SupportedKeys) => boolean) => {
    this.eventEmitter.on('keyUp', listener);

    return listener;
  };

  removeKeyupListener = (listener: (event: SupportedKeys) => boolean) => {
    this.eventEmitter.off('keyUp', listener);
  };

  emitKeyDown = (key: SupportedKeys) => {
    this.eventEmitter.emit('keyDown', key);
  };
}

export default new RemoteControlManager();
