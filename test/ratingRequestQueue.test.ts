import assert from 'node:assert/strict';
import { test } from 'node:test';
import { enqueueRatingRequest } from '../src/util/RatingRequestQueue';
import { SourceBlockedError, shouldRetrySourceQuery } from '../src/util/Request/sourceFailure';

test('ratings and bookmark metadata share a cooldown after a source failure', async () => {
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  let calls = 0;
  try {
    await assert.rejects(enqueueRatingRequest('ratings:failed', async () => {
      calls++;
      throw new Error('Service Temporarily Unavailable');
    }), /Temporarily/);
    await assert.rejects(enqueueRatingRequest('bookmark-metadata:next', async () => { calls++; return 'card'; }), /Temporarily/);
    assert.equal(calls, 1);
    now += 31_000;
    assert.equal(await enqueueRatingRequest('bookmark-metadata:retry', async () => { calls++; return 'card'; }), 'card');
    assert.equal(calls, 2);
    now += 1000;
    await assert.rejects(enqueueRatingRequest('REZKA:blocked', async () => { throw new SourceBlockedError('blocked'); }), SourceBlockedError);
    now += 31_000;
    await assert.rejects(enqueueRatingRequest('REZKA:another', async () => 'should not run'), SourceBlockedError);
    assert.equal(await enqueueRatingRequest('ZONA:independent', async () => 'Zona works'), 'Zona works');
    now += 5 * 60_000;
    assert.equal(await enqueueRatingRequest('REZKA:unblocked', async () => 'retry allowed'), 'retry allowed');
  } finally { Date.now = originalNow; }
});
test('blocked responses do not automatically retry; ordinary failures retain one retry', () => {
  assert.equal(shouldRetrySourceQuery(0, new SourceBlockedError('blocked')), false);
  assert.equal(shouldRetrySourceQuery(0, new Error('temporary')), true);
  assert.equal(shouldRetrySourceQuery(1, new Error('temporary')), false);
});