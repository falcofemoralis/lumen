import assert from 'node:assert/strict';
import { test } from 'node:test';
import { RezkaReadQueue } from '../src/util/RezkaReadQueue';
import { SourceBlockedError } from '../src/util/Request/sourceFailure';

test('read queue deduplicates requests, serializes traffic and puts foreground ahead of queued background work', async () => {
  const queue = new RezkaReadQueue(0);
  const order: string[] = [];
  let release!: (value: string) => void;
  const first = queue.run('first', () => { order.push('first'); return new Promise<string>((resolve) => { release = resolve; }); }, true);
  assert.equal(queue.run('first', async () => 'duplicate'), first);
  const background = queue.run('background', async () => { order.push('background'); return 'background'; }, true);
  const foreground = queue.run('foreground', async () => { order.push('foreground'); return 'foreground'; });
  assert.deepEqual(order, ['first']);
  release('first');
  await Promise.all([first, background, foreground]);
  assert.deepEqual(order, ['first', 'foreground', 'background']);
});
test('starts are spaced and timed-out requests abort without leaving the queue stuck', async () => {
  const spaced = new RezkaReadQueue(20);
  const starts: number[] = [];
  await Promise.all([spaced.run('a', async () => { starts.push(Date.now()); }), spaced.run('b', async () => { starts.push(Date.now()); })]);
  assert.ok(starts[1] - starts[0] >= 15);
  const queue = new RezkaReadQueue(0, 10);
  let signal!: AbortSignal;
  await assert.rejects(queue.run('stuck', (value) => { signal = value; return new Promise(() => {}); }), /не ответила/);
  assert.equal(signal.aborted, true);
  assert.equal(await queue.run('next', async () => 'works'), 'works');
});
test('403 cancels queued reads and prevents network requests until cooldown expires', async () => {
  let now = 1_000_000;
  const queue = new RezkaReadQueue(0, 1000, () => true, () => now);
  const error = new SourceBlockedError('blocked');
  let calls = 0;
  const failed = queue.run('blocked', async () => { calls++; throw error; });
  const queued = queue.run('queued', async () => { calls++; return 'never'; });
  await Promise.all([assert.rejects(failed, SourceBlockedError), assert.rejects(queued, SourceBlockedError)]);
  await assert.rejects(queue.run('another', async () => { calls++; return 'never'; }), SourceBlockedError);
  assert.equal(calls, 1);
  assert.equal(error.retryAt, now + 300_000);
  now += 300_000;
  assert.equal(await queue.run('resume', async () => 'ready'), 'ready');
});
test('only the latest queued search suggestion is sent to the source', async () => {
  const queue = new RezkaReadQueue(0);
  let release!: (value: string) => void;
  const active = queue.run('active', () => new Promise<string>((resolve) => { release = resolve; }));
  let calls = 0;
  const old = queue.run('old-text', async () => { calls++; return 'old'; }, false, 'suggestions');
  const cancelled = assert.rejects(old, /отменён/);
  const latest = queue.run('latest-text', async () => { calls++; return 'latest'; }, false, 'suggestions');
  release('done');
  await Promise.all([active, cancelled]);
  assert.equal(await latest, 'latest');
  assert.equal(calls, 1);
});