import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const registerFiles = createRequire(import.meta.url)('../../windows/files.cjs');

test('Windows directory scanning uses canonical source IDs, reports HLS media size and protects storage roots', async () => {
  const root = await mkdtemp(join(tmpdir(), 'lumen-windows-files-'));
  const listeners = new Map<string, Function>(), protocols = new Map<string, Function>();
  try {
    registerFiles({ app: { getPath: () => root }, ipcMain: { on: (name: string, fn: Function) => listeners.set(name, fn) },
      protocol: { handle: (name: string, fn: Function) => protocols.set(name, fn) }, handle() {}, assertSender() {}, dialog: {}, shell: {} });
    const invoke = (action: string, file: string, value?: string) => { const event = { returnValue: undefined as any }; listeners.get('file')!(event, action, file, value); if (event.returnValue?.error) throw new Error(event.returnValue.error); return event.returnValue; };
    const original = join(root, 'downloads', 'ANIXART:1'), canonical = join(root, 'downloads', 'ANIXART_1');
    invoke('mkdir', original); invoke('write', join(original, 'film.mp4'), 'abcd');
    assert.equal(invoke('path', 'file://' + join(original, 'film.mp4')), join(canonical, 'film.mp4'));
    invoke('mkdir', join(original, 'film.mp4.parts')); invoke('write', join(original, 'film.mp4.parts', 'part.bin'), 'media');
    assert.equal(invoke('size', join(original, 'film.mp4')), 9);
    assert.equal(invoke('list', original).length, 1, 'internal HLS segments are not scanned as extra downloaded films');
    const response = await protocols.get('lumen-file')!(new Request('lumen-file://app/?path=' + encodeURIComponent(join(canonical, 'film.mp4')), { headers: { Range: 'bytes=1-2' } }));
    assert.equal(response.status, 206); assert.equal(await response.text(), 'bc');
    assert.throws(() => invoke('rmdir', root.toUpperCase()), /Cannot remove a storage root/);
    invoke('rmdir', original); assert.equal(invoke('exists', original), false);
  } finally { assert.ok(root.startsWith(join(tmpdir(), 'lumen-windows-files-'))); await rm(root, { recursive: true, force: true }); }
});
