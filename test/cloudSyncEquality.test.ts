import assert from 'node:assert/strict';
import { test } from 'node:test';

import { equalCloudSyncData } from '../src/util/CloudSync/equality';

test('sync equality ignores object key order but detects changed payloads with unchanged metadata', () => {
  const first = { value: { title: 'Title', position: 1 }, meta: { updatedAt: 1, deviceId: 'a' } };
  const reordered = { meta: { deviceId: 'a', updatedAt: 1 }, value: { position: 1, title: 'Title' } };
  assert.equal(equalCloudSyncData(first, reordered), true);
  assert.equal(equalCloudSyncData(first, { ...first, value: { title: 'Changed', position: 1 } }), false);
  assert.equal(equalCloudSyncData(first, { ...first, meta: { ...first.meta, deleted: true } }), false);
  assert.equal(equalCloudSyncData([1, 2], [2, 1]), false);
  assert.equal(equalCloudSyncData({ value: undefined }, {}), false);
});
test('sync convergence does not re-read shared poster payloads after a merge', () => {
  let reads = 0;
  const record = { meta: { updatedAt: 1, deviceId: 'a' }, get value() { reads++;

    return 'poster'.repeat(10000); } };
  const records = Object.fromEntries(Array.from({ length: 2000 }, (_, index) => [String(index), record]));
  const first = { cardCache: records, history: {} };
  const merged = { cardCache: { ...records }, history: {} };
  assert.equal(equalCloudSyncData(first, merged), true);
  assert.equal(reads, 0);
});
