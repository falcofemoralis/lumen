import KeyEvent from 'react-native-keyevent';

import CustomEventEmitter from './CustomEventEmitter';
import { RemoteControlManagerInterface } from './RemoteControlManager.interface';
import { SupportedKeys } from './SupportedKeys';

const LONG_PRESS_DURATION = 500;

class RemoteControlManager implements RemoteControlManagerInterface {
  constructor() {
    KeyEvent.onKeyDownListener(this.handleKeyDown);
    KeyEvent.onKeyUpListener(this.handleKeyUp);
  }

  private eventEmitter = new CustomEventEmitter<{ keyDown: SupportedKeys }>();

  /**
   * Long enter
   */
  private isEnterKeyDownPressed = false;

  private longEnterTimeout: NodeJS.Timeout | null = null;

  private handleLongEnter = () => {
    this.longEnterTimeout = setTimeout(() => {
      this.eventEmitter.emit('keyDown', SupportedKeys.LongEnter);
      this.longEnterTimeout = null;
    }, LONG_PRESS_DURATION);
  };

  /**
   * Long Left
   */
  private isLeftKeyDownPressed = false;

  private isLongLeftFired = false;

  private longLeftTimeout: NodeJS.Timeout | null = null;

  private handleLongLeft = () => {
    this.longLeftTimeout = setTimeout(() => {
      this.eventEmitter.emit('keyDown', SupportedKeys.LongLeft);
      this.longLeftTimeout = null;
      this.isLongLeftFired = true;
    }, LONG_PRESS_DURATION);
  };

  /**
   * Long Right
   */
  private isRightKeyDownPressed = false;

  private isLongRightFired = false;

  private longRightTimeout: NodeJS.Timeout | null = null;

  private handleLongRight = () => {
    this.longRightTimeout = setTimeout(() => {
      this.eventEmitter.emit('keyDown', SupportedKeys.LongRight);
      this.longRightTimeout = null;
      this.isLongRightFired = true;
    }, LONG_PRESS_DURATION);
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

    if (mappedKey === SupportedKeys.Left) {
      if (!this.isLeftKeyDownPressed) {
        this.isLeftKeyDownPressed = true;
        this.handleLongLeft();
      }

      return;
    }

    if (mappedKey === SupportedKeys.Right) {
      if (!this.isRightKeyDownPressed) {
        this.isRightKeyDownPressed = true;
        this.handleLongRight();
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

    if (mappedKey === SupportedKeys.Left) {
      this.isLeftKeyDownPressed = false;

      if (this.isLongLeftFired) {
        this.isLongLeftFired = false;
        this.eventEmitter.emit('keyDown', SupportedKeys.LongLeft);

        return;
      }

      if (this.longLeftTimeout) {
        clearTimeout(this.longLeftTimeout);
        this.eventEmitter.emit('keyDown', mappedKey);
      }
    }

    if (mappedKey === SupportedKeys.Right) {
      this.isRightKeyDownPressed = false;

      if (this.isLongRightFired) {
        this.isLongRightFired = false;
        this.eventEmitter.emit('keyDown', SupportedKeys.LongRight);

        return;
      }

      if (this.longRightTimeout) {
        clearTimeout(this.longRightTimeout);
        this.eventEmitter.emit('keyDown', mappedKey);
      }
    }
  };

  addKeydownListener = (listener: (event: SupportedKeys) => boolean) => {
    this.eventEmitter.on('keyDown', listener);

    return listener;
  };

  removeKeydownListener = (listener: (event: SupportedKeys) => boolean) => {
    this.eventEmitter.off('keyDown', listener);
  };

  emitKeyDown = (key: SupportedKeys) => {
    this.eventEmitter.emit('keyDown', key);
  };
}

export default new RemoteControlManager();
