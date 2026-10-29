import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPosterPrefetchQueue } from '../src/util/Film/PosterPrefetch';
const tick = () => new Promise(resolve => setImmediate(resolve));

test('Poster look-ahead shares cached URLs and bounds concurrent image downloads', async () => {
  const calls: string[] = [], release: Array<() => void> = [];
  let active = 0, maximum = 0;
  const queue = createPosterPrefetchQueue(async url => {
    calls.push(url); active++; maximum = Math.max(maximum, active);
    await new Promise<void>(resolve => release.push(resolve)); active--; return true;
  }, 2);
  queue(['https://cdn.test/1.jpg', 'https://cdn.test/2.jpg', 'https://cdn.test/3.jpg', 'file:///cached.jpg']);
  queue(['https://cdn.test/1.jpg', 'https://cdn.test/2.jpg', 'https://cdn.test/4.jpg']);
  await tick();
  assert.equal(calls.length, 2);
  release.splice(0).forEach(done => done()); await tick();
  assert.equal(calls.length, 4);
  release.splice(0).forEach(done => done()); await tick();
  queue(['https://cdn.test/1.jpg']); await tick();
  assert.equal(calls.length, 4);
  assert.equal(maximum, 2);
});
test('A rapid poster scroll cannot create an unbounded background queue', async () => {
  let count = 0;
  const queue = createPosterPrefetchQueue(async () => { count++; return true; });
  queue(Array.from({length: 1000}, (_, i) => 'https://cdn.test/' + i + '.jpg'));
  for (let i = 0; i < 10; i++) await tick();
  assert.equal(count, 24);
});
test('Failed poster downloads can be retried instead of being marked cached', async () => {
  let calls = 0;
  const queue = createPosterPrefetchQueue(async () => ++calls > 1);
  queue(['https://cdn.test/failure.jpg']); await tick();
  queue(['https://cdn.test/failure.jpg']); await tick();
  assert.equal(calls, 2);
  queue(['https://cdn.test/failure.jpg']); await tick();
  assert.equal(calls, 2);
});