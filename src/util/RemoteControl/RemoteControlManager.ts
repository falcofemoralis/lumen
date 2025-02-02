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
      this.eventEmitter.emit('keyDown', SupportedKeys.LongEnter);
      this.longEnterTimeout = null;
    }, LONG_PRESS_DURATION);
  };

  public subscribe = () => {
    KeyEvent.onKeyDownListener(this.handleKeyDown);
    KeyEvent.onKeyUpListener(this.handleKeyUp);
  };

  private handleKeyDown = (keyEvent: { keyCode: number }) => {
    const mappedKey = {
      21: SupportedKeys.Left,
      22: SupportedKeys.Right,
      20: SupportedKeys.Down,
      19: SupportedKeys.Up,
      66: SupportedKeys.Enter,
      23: SupportedKeys.Enter,
      67: SupportedKeys.Back,
      4: SupportedKeys.Back,
    }[keyEvent.keyCode];

    if (!mappedKey) {
      return;
    }

    if (mappedKey === SupportedKeys.Enter) {
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
      21: SupportedKeys.Left,
      22: SupportedKeys.Right,
      66: SupportedKeys.Enter,
      23: SupportedKeys.Enter,
    }[keyEvent.keyCode];

    if (!mappedKey) {
      return;
    }

    if (mappedKey === SupportedKeys.Enter) {
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
