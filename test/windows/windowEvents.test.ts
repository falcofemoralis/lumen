import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const sender = createRequire(import.meta.url)('../../windows/window-events.cjs');
test('Delayed Windows events are safe after the window or renderer is destroyed', () => {
  let accessed = false;
  assert.equal(sender(() => ({ isDestroyed: () => true, get webContents() { accessed = true; throw new Error('Object has been destroyed'); } }))('closed'), false);
  assert.equal(accessed, false);
  assert.equal(sender(() => null)('closed'), false);
  assert.equal(sender(() => ({ isDestroyed: () => false, webContents: { isDestroyed: () => true, send() { throw new Error('Must not send'); } } }))('progress'), false);
  assert.equal(sender(() => ({ isDestroyed: () => false, webContents: { isDestroyed: () => false, send() { throw new Error('Object has been destroyed'); } } }))('closed'), false);
});
test('Windows events still arrive and unrelated IPC errors are not suppressed', () => {
  const received: unknown[] = [];
  const send = sender(() => ({ isDestroyed: () => false, webContents: { isDestroyed: () => false, send: (...args: unknown[]) => received.push(args) } }));
  assert.equal(send('rating', { value: 8.2 }), true);
  assert.deepEqual(received, [['rating', { value: 8.2 }]]);
  assert.throws(() => sender(() => ({ isDestroyed: () => false, webContents: { isDestroyed: () => false, send() { throw new Error('Unexpected IPC bug'); } } }))('test'), /Unexpected IPC bug/);
});
