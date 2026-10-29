import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fetchZonaText, withDeadline } from '../../src/source/request';
test('deadline covers a stalled response body even after HTTP headers have arrived', async () => {
  const originalFetch = globalThis.fetch;
  let signal: AbortSignal | undefined;
  globalThis.fetch = async (_input, init) => {
    signal = init?.signal as AbortSignal;
    return { ok: true, text: () => new Promise<string>(() => {}) } as Response;
  };
  try {
    await assert.rejects(fetchZonaText('https://w1.zona.im/movies', 15), /Zona не ответила/);
    assert.equal(signal?.aborted, true);
  } finally { globalThis.fetch = originalFetch; }
});
test('a transport ignoring AbortSignal still cannot hold the caller forever', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => new Promise<Response>(() => {});
  try { await assert.rejects(fetchZonaText('https://w1.zona.im/movies', 15), /Zona не ответила/); }
  finally { globalThis.fetch = originalFetch; }
});
test('a successful complete body is returned and a failed HTTP response is rejected', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('catalog');
    assert.equal(await fetchZonaText('https://w1.zona.im/movies'), 'catalog');
    globalThis.fetch = async () => new Response('', { status: 504 });
    await assert.rejects(fetchZonaText('https://w1.zona.im/movies'), /504/);
    await assert.rejects(withDeadline(new Promise(() => {}), 15), /Источник не ответил/);
  } finally { globalThis.fetch = originalFetch; }
});
