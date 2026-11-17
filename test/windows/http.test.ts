import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const registerHttp = createRequire(import.meta.url)('../../windows/http.cjs');

test('Cancelling a Windows source request aborts the actual HTTP connection and releases its tracking state', async () => {
  const handlers = new Map<string, Function>(); let aborted = false;
  registerHttp({ mediaHeaders: new Map(), handle: (name: string, fn: Function) => handlers.set(name, fn),
    session: { defaultSession: { fetch: (_url: string, options: { signal: AbortSignal }) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => { aborted = true; reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
    }) } } });
  const pending = handlers.get('fetch')!({ requestId: 'probe', url: 'https://example.com', method: 'GET', headers: {} });
  assert.equal(handlers.get('fetch:abort')!('probe'), true);
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(aborted, true);
  assert.equal(handlers.get('fetch:abort')!('probe'), false);
});

test('Windows challenge requests preserve manual redirects and omit native cookies', async () => {
  const handlers = new Map<string, Function>(); let received: any;
  registerHttp({ manualFetch: async (_url: string, options: any) => { received = options; return new Response(null, {status:302,headers:{'set-cookie':'techaro.lol-anubis-auth=clearance; Path=/'}}); }, mediaHeaders: new Map(), handle: (name: string, fn: Function) => handlers.set(name, fn),
    session: { defaultSession: { fetch: async (_url: string, options: any) => {
      received = options;
      return new Response(null, { status: 302, headers: { 'set-cookie': 'techaro.lol-anubis-auth=clearance; Path=/' } });
    } } } });
  const result = await handlers.get('fetch')!({ requestId: 'challenge', url: 'https://example.com/pass', method: 'GET', headers: {}, redirect: 'manual', credentials: 'omit' });
  assert.equal(received.redirect, 'manual');
  assert.equal(received.credentials, 'omit');
  assert.equal(result.status, 302);
  assert.ok(result.headers.some(([name]: string[]) => name === 'set-cookie'));
});
test('Playback media headers cannot replace the current source verification cookie or User-Agent', async () => {
  const handlers = new Map<string, Function>(); let received: any;
  registerHttp({ mediaHeaders: new Map([['https://example.com', { Cookie: 'stale-media-cookie', 'User-Agent': 'stale-media-agent' }]]),
    handle: (name: string, fn: Function) => handlers.set(name, fn),
    session: { defaultSession: { fetch: async (_url: string, options: any) => { received=options; return new Response('ok'); } } } });
  await handlers.get('fetch')!({requestId:'source',url:'https://example.com/pass',method:'GET',headers:{cookie:'current-verification', 'user-agent':'current-agent'}});
  assert.equal(new Headers(received.headers).get('cookie'), 'current-verification');
  assert.equal(new Headers(received.headers).get('user-agent'), 'current-agent');
});