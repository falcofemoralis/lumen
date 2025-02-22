import KeyEvent from 'react-native-keyevent';

import CustomEventEmitter from './CustomEventEmitter';
import { RemoteControlManagerInterface } from './RemoteControlManager.interface';
import { SupportedKeys } from './SupportedKeys';

const LONG_PRESS_DURATION = 500;

class RemoteControlManager implements RemoteControlManagerInterface {
  private eventEmitter = new CustomEventEmitter<{ keyDown: SupportedKeys, keyUp: SupportedKeys }>();

  private isEnterKeyDownPressed = false;

  private longEnterTimeout: NodeJS.Timeout | null = null;

  private handleLongEnter = () => {
    this.longEnterTimeout = setTimeout(() => {
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
      21: SupportedKeys.LEFT,
      22: SupportedKeys.RIGHT,
      20: SupportedKeys.DOWN,
      19: SupportedKeys.UP,
      66: SupportedKeys.ENTER,
      23: SupportedKeys.ENTER,
      67: SupportedKeys.BACK,
      4: SupportedKeys.BACK,
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
      66: SupportedKeys.ENTER,
      23: SupportedKeys.ENTER,
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
