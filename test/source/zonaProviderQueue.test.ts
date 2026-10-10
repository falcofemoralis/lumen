import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  registerZonaProviderBridge, requestZonaStreamsFromProvider,
  setZonaStreamWebViewReady, setZonaStreamWebViewSender, resolveZonaStreamRequest,
} from '../../src/component/ZonaStreamProvider/ZonaStreamProvider.container';
test('a request waiting for Zona runtime readiness times out instead of hanging forever', async () => {
  const set = globalThis.setTimeout, clear = globalThis.clearTimeout;
  const callbacks = new Map<number, () => void>();
  let id = 0;
  globalThis.setTimeout = ((callback: () => void) => { callbacks.set(++id, callback); return id; }) as typeof set;
  globalThis.clearTimeout = ((timer: number) => { callbacks.delete(timer); }) as typeof clear;
  const unregister = registerZonaProviderBridge();
  try {
    setZonaStreamWebViewReady(false);
    const waiting = requestZonaStreamsFromProvider({ kinopoiskId: 430, episodeKey: null });
    const assertion = assert.rejects(waiting, /did not become available/);
    callbacks.values().next().value!();
    await assertion;
  } finally { unregister(); globalThis.setTimeout = set; globalThis.clearTimeout = clear; }
});
test('dispatch clears the waiting timer and native stream result still resolves normally', async () => {
  const set = globalThis.setTimeout, clear = globalThis.clearTimeout;
  const callbacks = new Map<number, () => void>();
  let id = 0, requestId = '';
  globalThis.setTimeout = ((callback: () => void) => { callbacks.set(++id, callback); return id; }) as typeof set;
  globalThis.clearTimeout = ((timer: number) => { callbacks.delete(timer); }) as typeof clear;
  const unregister = registerZonaProviderBridge();
  try {
    setZonaStreamWebViewSender((request) => { requestId = request.requestId; });
    setZonaStreamWebViewReady(true);
    const pending = requestZonaStreamsFromProvider({ kinopoiskId: 430, episodeKey: null });
    assert.equal(callbacks.size, 1, 'only active request timer remains');
    assert.ok(requestId);
    resolveZonaStreamRequest(requestId, []);
    assert.deepEqual(await pending, []);
    assert.equal(callbacks.size, 0);
  } finally { unregister(); globalThis.setTimeout = set; globalThis.clearTimeout = clear; }
});
