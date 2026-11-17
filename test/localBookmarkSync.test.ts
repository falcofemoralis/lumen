import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

import { FilmType } from '../src/type/FilmType.type';
import { toggleBookmark } from '../src/util/LocalLibrary/logic';

function bookmarks() {
  const text = readFileSync('src/util/LocalLibrary/index.ts', 'utf8');
  const source = ts.createSourceFile('Library.ts', text, ts.ScriptTarget.Latest, true);
  const declarations: string[] = [], names = new Set(['getBookmarkMembershipId', 'toggleLocalBookmark']);
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && names.has(node.name.getText(source))) {
      declarations.push('const ' + node.getText(source) + ';');
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  const card = (id: string) => ({ id, title: id, link: `/films/drama/${ id }-example.html`,
    poster: '', subtitle: '2020', type: FilmType.FILM });
  const initial = Array.from({ length: 100 }, (_, i) => card(String(i + 1)));
  let current = { categories: [{ id: 'folder', title: 'Folder', filmIds: initial.map(item => item.id), createdAt: 1 }],
    films: Object.fromEntries(initial.map(item => [item.id, item])) };
  let mutations: any[] = [];
  const context: any = { toggleBookmark, lastBookmarkInsertionRank: 0,
    getLocalBookmarks: () => current, saveLocalBookmarks: (value: any) => { current = value; },
    mutateCloudSyncBatch: (value: any[]) => { mutations = value; },
  };
  const compiled = ts.transpileModule(`${declarations.join('\n') }\nglobalThis.toggle = toggleLocalBookmark;`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, context);

  return { card, toggle: context.toggle, current: () => current, mutations: () => mutations };
}

test('adding one film persists it immediately without re-publishing every other folder member', () => {
  const store = bookmarks(); store.toggle(store.card('101'), 'folder', true);
  assert.equal(store.current().categories[0].filmIds[0], '101');
  assert.equal(store.mutations().length, 1);
  assert.equal(store.mutations()[0].value.filmId, '101');
  assert.ok(store.mutations()[0].value.position < 0);
});

test('removing a bookmark publishes only its tombstone and leaves other members in place', () => {
  const store = bookmarks(); store.toggle(store.card('1'), 'folder', false);
  assert.equal(store.current().categories[0].filmIds.length, 99);
  assert.equal(store.mutations().length, 1);
  assert.equal(store.mutations()[0].deleted, true);
});

test('quick consecutive additions keep newest-first order after cloud restoration', () => {
  const store = bookmarks(); store.toggle(store.card('101'), 'folder', true);
  const firstRank = store.mutations()[0].value.position;
  store.toggle(store.card('102'), 'folder', true);
  assert.ok(store.mutations()[0].value.position < firstRank);
});
