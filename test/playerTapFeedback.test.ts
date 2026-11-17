import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

function handlers() {
  const text = readFileSync('src/component/Player/Player.component.tsx', 'utf8');
  const source = ts.createSourceFile('Player.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations: string[] = [];
  const names = new Set(['handleDoubleTap', 'handleSingleTap', 'singleTap']);
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && names.has(node.name.text)) {
      declarations.push(`const ${ node.getText(source) };`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  let visible = false, feedback: any = null, scheduled: (() => void) | undefined;
  let nextTimer = 0;
  type Callback = () => void;
  const extraTimers = new Map<number, Callback>();
  const tap: any = { maxDuration: () => tap, onEnd: (callback: Function) => { tap.end = callback;

    return tap; } };
  const context: any = {
    Gesture: { Tap: () => tap }, RewindDirection: { BACKWARD: 'back', FORWARD: 'forward' },
    playerBackwardRewindSeconds: 10, playerRewindSeconds: 10,
    DOUBLE_TAP_ANIMATION: 650, DOUBLE_TAP_ANIMATION_DELAY: 150,
    doubleTapAction: { isVisible: false }, showControls: false,
    doubleTapLeftOpacity: { value: 0 }, doubleTapRightOpacity: { value: 0 },
    withDelay: (_delay: number, value: unknown) => value, withTiming: (value: unknown) => value,
    doubleTapTimeout: {
      start: (callback: () => void) => { scheduled = callback; }, stop: () => { scheduled = undefined; },
    },
    setDoubleTapAction: (value: any) => { feedback = typeof value === 'function' ? value(feedback) : value; },
    setShowControls: (value: any) => { visible = typeof value === 'function' ? value(visible) : value; },
    setTimeout: (callback: () => void) => { extraTimers.set(++nextTimer, callback);

      return nextTimer; },
    rewindPosition() {}, handleUserInteraction() {}, scheduleOnRN: (fn: Function, ...args: unknown[]) => fn(...args),
  };
  const code = declarations.join('\n') + '\n globalThis.actions = { handleDoubleTap, singleTap };';
  const compiled = ts.transpileModule(code,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, context);

  return {
    ...context.actions, extraTimers, expire: () => scheduled?.(), visible: () => visible, feedback: () => feedback,
  };
}

test('one tap can show controls while an old seek indicator is finishing', () => {
  const player = handlers(); player.singleTap.end({}, true);
  assert.equal(player.visible(), true);
});

test('expired seek feedback cannot clear feedback from a newer double tap', () => {
  const player = handlers(); player.handleDoubleTap('forward'); player.expire();
  player.handleDoubleTap('forward');
  for (const callback of player.extraTimers.values()) callback();
  assert.equal(player.feedback()?.isVisible, true);
});
