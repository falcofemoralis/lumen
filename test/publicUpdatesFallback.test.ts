import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPublicReadFallback } from '../src/util/Request/publicReadFallback';
import { SourceBlockedError } from '../src/util/Request/sourceFailure';
test('Blocked public update reads share one mirror request and keep its result for subsequent callers', async () => {
 const read=createPublicReadFallback<string>(); let calls=0;
 const primary=async()=>{throw new SourceBlockedError('blocked');};
 const fallback=async()=>{calls++;return 'public updates';};
 assert.deepEqual(await Promise.all([read(primary,fallback),read(primary,fallback)]),['public updates','public updates']);
 assert.equal(await read(primary,fallback),'public updates'); assert.equal(calls,1);
});
test('Successful primary requests and account-style failures do not invoke a public fallback', async () => {
 const read=createPublicReadFallback<string>(); let calls=0;
 const fallback=async()=>{calls++;return 'fallback';};
 assert.equal(await read(async()=>'primary',fallback),'primary');
 await assert.rejects(read(async()=>{throw new Error('bad response');},fallback),/bad response/);
 assert.equal(calls,0);
});