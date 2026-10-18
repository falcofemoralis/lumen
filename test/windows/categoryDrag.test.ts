import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const exports: any = {};
const code = ts.transpileModule(readFileSync('src/component/LocalCategoriesOverlay/LocalCategoryDragRow.web.tsx', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
runInNewContext(code, { exports, require: (name: string) => {
  if (name === 'react/jsx-runtime') return require(name);
  if (name === 'react') return { useState: () => [false, () => {}], useEffect() {} };
  if (name === 'Theme/context') return { useAppTheme: () => ({ theme: { colors: { primary: '#fff' } } }) };
  return {};
} });
const payload = (id: string, type = 'application/x-lumen-bookmark-category') => ({
  prevented: false,
  stopped: false,
  dataTransfer: { types: [type], getData: () => id },
  preventDefault() { this.prevented = true; },
  stopPropagation() { this.stopped = true; },
});

test('Folder mouse drops use current IDs to reorder in either direction', () => {
  const moves: number[][] = [];
  const row = (target: string, order: string[]) => exports.LocalCategoryDragRow({ categoryId: target, categoryIds: order, onReorder: (...move: number[]) => moves.push(move) });
  const drop = payload('one');
  row('three', ['one', 'two', 'three']).props.onDrop(drop);
  assert.deepEqual(moves, [[0, 2]]);
  assert.equal(drop.prevented, true);
  assert.equal(drop.stopped, true);
  row('two', ['two', 'three', 'one']).props.onDrop(payload('one'));
  assert.deepEqual(moves, [[0, 2], [2, 0]]);
});

test('Folder drops ignore external files, deleted IDs and the same folder', () => {
  let moves = 0;
  const row = exports.LocalCategoryDragRow({ categoryId: 'one', categoryIds: ['one', 'two'], onReorder: () => moves++ });
  row.props.onDrop(payload('one'));
  row.props.onDrop(payload('deleted'));
  const external = payload('two', 'Files');
  row.props.onDrop(external);
  assert.equal(moves, 0);
  assert.equal(external.prevented, false);
});

test('Only the folder grip starts a move with a category ID payload', () => {
  const handle = exports.LocalCategoryDragHandle({ categoryId: 'one' });
  const writes: string[][] = [];
  const event = { dataTransfer: { effectAllowed: '', setData: (...args: string[]) => writes.push(args) }, stopPropagation() {} };
  handle.props.onDragStart(event);
  assert.equal(handle.props.draggable, true);
  assert.equal(event.dataTransfer.effectAllowed, 'move');
  assert.deepEqual(writes, [['application/x-lumen-bookmark-category', 'one']]);
});