import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

function gate() {
  const text = readFileSync('src/context/CloudSyncContext.tsx', 'utf8');
  const source = ts.createSourceFile('CloudSync.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let sync = '', listener = '';
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'syncNow') {
      sync = node.initializer!.getText(source);
    }
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'navigationRef.addListener') {
      listener = node.arguments[1].getText(source);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  let route = 'Player', scheduled = 0, started = 0;
  const context: any = {
    useCallback: (fn: Function) => fn, connected: true, isInternetAvailable: true,
    syncInProgressRef: { current: false }, pendingSyncRef: { current: false },
    PLAYER_SCREEN: 'Player', navigationRef: { getCurrentRoute: () => ({ name: route }) },
    scheduleSync: () => scheduled++, setSyncing: () => started++,
  };
  const compiled = ts.transpileModule(`globalThis.sync = ${ sync }; globalThis.listener = ${ listener };`,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, context);

  return { context, route: (value: string) => { route = value; }, scheduled: () => scheduled, started: () => started };
}

test('automatic Drive synchronization waits while the player is visible', async () => {
  const player = gate(); await player.context.sync();
  assert.equal(player.context.pendingSyncRef.current, true);
  assert.equal(player.started(), 0);
  player.context.listener(); assert.equal(player.scheduled(), 0);
  player.route('Home'); player.context.listener(); assert.equal(player.scheduled(), 1);
});
