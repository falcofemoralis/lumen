import { AddEventListenersOptions, BaseWebAdapter, Key } from '@noriginmedia/norigin-spatial-navigation-core';
import RemoteControlManager from './RemoteControlManager';
import { SupportedKeys } from './SupportedKeys';

const KEY_MAP: Partial<Record<SupportedKeys, Key>> = {
  [SupportedKeys.LEFT]: 'left', [SupportedKeys.RIGHT]: 'right',
  [SupportedKeys.UP]: 'up', [SupportedKeys.DOWN]: 'down', [SupportedKeys.ENTER]: 'enter',
};
export default class RemoteControlLayoutAdapter extends BaseWebAdapter {
  private remoteKeyListener?: (key: SupportedKeys) => boolean;

  blurNode = (component: Parameters<BaseWebAdapter['blurNode']>[0]): void => {
    (component.node as unknown as HTMLElement)?.removeAttribute('data-focused');
  };

  private preventScroll = (event: KeyboardEvent) => {
    if (document.activeElement?.matches('input,textarea,[contenteditable=true]')) return;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  };

  addEventListeners = ({ keyDown }: AddEventListenersOptions): void => {
    RemoteControlManager.subscribe();
    this.remoteKeyListener = RemoteControlManager.addKeydownListener(key => {
      const mapped = KEY_MAP[key];
      if (mapped) keyDown?.(mapped, null as unknown as Event);
      return false;
    });
    document.addEventListener('keydown', this.preventScroll);
  };

  removeEventListeners = (): void => {
    if (this.remoteKeyListener) RemoteControlManager.removeKeydownListener(this.remoteKeyListener);
    document.removeEventListener('keydown', this.preventScroll);
  };
}
