import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createBufferedWriter } from '../../src/windows/storage-buffer.js';

test('storage batches bursts and UI changes do not wait for disk IPC', async () => {
  const writes: unknown[] = [];
  let release!: () => void;
  const writer = createBufferedWriter(async value => { writes.push(value); await new Promise<void>(resolve => { release = resolve; }); return true; }, () => true, 1000);
  writer.changed('one'); writer.changed('two');
  assert.equal(writes.length, 0);
  const pending = writer.flush();
  assert.deepEqual(writes, ['two']);
  writer.changed('three');
  release(); await pending;
  const final = writer.flush();
  assert.deepEqual(writes, ['two', 'three']);
  release(); await final;
  writer.flushSync();
});
test('unload flushes the latest pending data synchronously', () => {
  const writes: unknown[] = [];
  const writer = createBufferedWriter(async () => true, value => { writes.push(value); return true; }, 1000);
  writer.changed('latest'); writer.flushSync(); writer.flushSync();
  assert.deepEqual(writes, ['latest']);
});