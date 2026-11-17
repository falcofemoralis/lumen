import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RezkaReadQueue } from '../src/util/RezkaReadQueue';

// The challenge flag used to suppress the deadline forever, blocking every subsequent read.
test('an abandoned challenge cannot hold the read queue indefinitely', async () => {
  const queue = new RezkaReadQueue(0, 5, () => false, () => Date.now(), 25);
  const stuck = queue.run('abandoned', () => new Promise(() => {}));
  const bounded = Promise.race([stuck, new Promise((_, reject) => setTimeout(() => reject(new Error('queue still stuck')), 150))]);
  await assert.rejects(bounded, /HDRezka не ответила вовремя/);
  assert.equal(await queue.run('after', async () => 'ready'), 'ready');
});

test('a lost challenge promise releases its session and permits a new attempt', async () => {
  const { runBoundedChallenge } = await import('../src/util/Request/boundedChallenge');
  const sessions = new Map<string, Promise<boolean>>();
  let aborted = false;
  const first = runBoundedChallenge(sessions, 'rezka', () => new Promise(() => {}), 10, () => { aborted = true; });
  assert.equal(runBoundedChallenge(sessions, 'rezka', async () => true, 10), first);
  assert.equal(await first, false);
  assert.equal(aborted, true);
  assert.equal(sessions.size, 0);
  assert.equal(await runBoundedChallenge(sessions, 'rezka', async () => true, 10), true);
  assert.equal(sessions.size, 0);
});
