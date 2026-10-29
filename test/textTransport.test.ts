import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createTextTransport } from '../src/util/Request/textTransport';

test('gateway reads retry once, writes never replay, body stalls time out', async () => {
  let calls = 0;
  const transport = createTextTransport((async () => new Response(++calls === 1 ? 'gateway' : 'ok', { status: calls === 1 ? 504 : 200 })) as typeof fetch);
  assert.equal((await transport('https://source.test')).text, 'ok');
  assert.equal(calls, 2);
  calls = 0;
  assert.equal((await transport('https://source.test', { method: 'POST' })).response.status, 504);
  assert.equal(calls, 1);
  const stalled = createTextTransport((async () => ({ text: () => new Promise(() => {}) })) as unknown as typeof fetch);
  await assert.rejects(stalled('https://source.test', {}, 15), /вовремя/);
});
test('host concurrency is bounded and cancelling a queued read prevents fetch', async () => {
  const releases: (() => void)[] = [];
  let calls = 0;
  const transport = createTextTransport((async () => { calls++; await new Promise<void>(resolve => releases.push(resolve)); return new Response('ok'); }) as typeof fetch, 1);
  const first = transport('https://source.test/1');
  await new Promise(resolve => setImmediate(resolve));
  const controller = new AbortController();
  const second = transport('https://source.test/2', { signal: controller.signal });
  const rejected = assert.rejects(second);
  controller.abort(); await rejected;
  assert.equal(calls, 1);
  releases.shift()!(); await first;
  const third = transport('https://source.test/3');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(calls, 2); releases.shift()!(); await third;
});
test('identical reads coalesce but different account cookies remain isolated', async () => {
  let calls = 0;
  const transport = createTextTransport((async () => { calls++; await new Promise(resolve => setTimeout(resolve, 10)); return new Response('ok'); }) as typeof fetch);
  const [first, second] = await Promise.all([transport('https://source.test'), transport('https://source.test')]);
  assert.equal(calls, 1); assert.equal(first.text, second.text);
  await Promise.all([
    transport('https://source.test', { headers: { Cookie: 'account=one' } }),
    transport('https://source.test', { headers: { Cookie: 'account=two' } }),
  ]);
  assert.equal(calls, 3);
});