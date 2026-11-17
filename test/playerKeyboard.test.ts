import assert from 'node:assert/strict';
import { test } from 'node:test';
import Module from 'node:module';

test('space toggles once per physical press, ignoring key-repeat until release', async () => {
  const native = Module as unknown as { _load: (...args: unknown[]) => unknown };
  const original = native._load;
  let keyDown!: (event: { keyCode: number }) => void;
  let keyUp!: (event: { keyCode: number }) => void;
  const keyEvent = {
    onKeyDownListener: (listener: typeof keyDown) => { keyDown = listener; },
    onKeyUpListener: (listener: typeof keyUp) => { keyUp = listener; },
  };
  native._load = function(request, ...args) {
    if (request === 'react-native-keyevent') return keyEvent;
    if (request === 'Util/Misc' || String(request).replace(/\\/g, '/').includes('/util/Misc')) {
      return { setTimeoutSafe: setTimeout };
    }
    return original.call(this, request, ...args);
  };
  try {
    const { default: manager } = await import('../src/util/RemoteControl/RemoteControlManager');
    const { SupportedKeys } = await import('../src/util/RemoteControl/SupportedKeys');
    let toggles = 0;
    const listener = manager.addKeydownListener(key => {
      if (key !== SupportedKeys.SPACE) return false;
      toggles++;
      return true;
    });
    manager.subscribe();
    for (let index = 0; index < 12; index++) keyDown({ keyCode: 62 });
    assert.equal(toggles, 1);
    keyUp({ keyCode: 62 });
    keyDown({ keyCode: 62 });
    keyUp({ keyCode: 62 });
    assert.equal(toggles, 2);
    manager.removeKeydownListener(listener);
    keyDown({ keyCode: 62 });
    keyUp({ keyCode: 62 });
    assert.equal(toggles, 2);
  } finally { native._load = original; }
});