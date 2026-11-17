import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

test('Zona keeps successful metadata during gateway errors and retries after a short cooldown', async () => {
  const source = readFileSync('src/source/adapters/ZonaSourceAdapter.ts', 'utf8');
  const start = source.indexOf('const metadataCache =');
  const end = source.indexOf('export const isZonaWebAvailable', start);
  assert.ok(start > 0 && end > start);
  let now = 1000, calls = 0;
  const entity = { data: { kp_id: 430 } };
  const context: any = {
    Date: { now: () => now },
    fetchZonaEntity: async () => {
      calls++;
      if (calls > 1) throw new Error('Zona: HTTP 502');

      return entity;
    },
  };
  const code = `${source.slice(start, end) }\nglobalThis.load = getZonaMetadata;`;
  const compiled = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, context);
  assert.equal(await context.load('film'), entity);
  now += 6 * 60_000;
  assert.equal(await context.load('film'), entity);
  assert.equal(await context.load('film'), entity);
  assert.equal(calls, 2);
  now += 31_000;
  assert.equal(await context.load('film'), entity);
  assert.equal(calls, 3);
  now += 24 * 60 * 60_000;
  await assert.rejects(context.load('film'), /502/);
  await assert.rejects(context.load('another-film'), /502/);
});