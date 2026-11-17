import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createCloudStateStore } from '../src/util/CloudSync/stateStore';
import type { CloudSyncState } from '../src/util/CloudSync/types';

const state = (): CloudSyncState => ({ schemaVersion: 1, revision: 1, updatedAt: 1, deviceId: 'device',
  bookmarks: { categories: {}, memberships: {} }, history: {}, playerTime: {}, scheduleMarks: {}, comments: {},
  settings: { values: {}, metadata: {} },
  cardCache: { poster: { value: { payload: 'x'.repeat(100_000) }, meta: { updatedAt: 1, deviceId: 'device' } } },
});
const storage = () => {
  const data = new Map<string, string>(), writes: { key: string; length: number }[] = [], reads: string[] = [];

  return { data, writes, reads,
    load<T>(key: string): T | null { reads.push(key); const raw = data.get(key);

      return raw ? JSON.parse(raw) : null; },
    save(key: string, value: unknown) {
      const raw = JSON.stringify(value);
      writes.push({ key, length: raw.length });
      data.set(key, raw);

      return true; },
  };
};

test('poster cache is not parsed or serialized again for every bookmark/progress mutation', () => {
  const backing = storage(), store = createCloudStateStore(backing);
  store.save(state());
  backing.reads.length = 0; backing.writes.length = 0;
  for (let i = 0; i < 5; i++) {
    const next = store.load()!; next.revision++;
    next.history['film'] = { value: i, meta: { updatedAt: i, deviceId: 'device' } };
    store.save(next);
  }
  assert.ok(backing.writes.every(write => write.length < 1000));
  assert.ok(backing.reads.every(key => key !== 'cloudSyncCardCache'));
  assert.equal(createCloudStateStore(backing).load()?.cardCache?.poster.meta.updatedAt, 1);
});

test('legacy inline caches migrate without changing the cloud payload or losing bookmarks', () => {
  const backing = storage(), old = state(); backing.save('cloudSyncState', old);
  const store = createCloudStateStore(backing); assert.deepEqual(store.load(), old);
  store.save(store.load()!); assert.deepEqual(createCloudStateStore(backing).load(), old);
  const next = store.load()!;
  next.cardCache!.poster = { value: 'updated', meta: { updatedAt: 2, deviceId: 'device' } };
  store.save(next); assert.deepEqual(createCloudStateStore(backing).load(), next);
});

test('restoring another snapshot refreshes the poster cache and clearing storage does not resurrect it', () => {
  const backing = storage(), store = createCloudStateStore(backing); store.save(state());
  const another = createCloudStateStore(backing), next = another.load()!;
  next.cardCache!.poster = { value: 'remote', meta: { updatedAt: 2, deviceId: 'phone' } };
  another.save(next); assert.deepEqual(store.load()?.cardCache, next.cardCache);
  backing.data.clear(); assert.equal(store.load(), null);
  backing.save('cloudSyncState', { ...state(), cardCache: undefined });
  assert.equal(store.load()?.cardCache, undefined);
});
