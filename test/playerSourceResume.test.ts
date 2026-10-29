import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

import ts from 'typescript';

function actions() {
  const text = readFileSync('src/component/Player/Player.container.tsx', 'utf8');
  const source = ts.createSourceFile('Player.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations: string[] = [];
  const names = new Set(['getCurrentPosition', 'handlePlaybackError', 'handleQualityChange']);
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && names.has(node.name.text)) {
      declarations.push(`const ${ node.getText(source) };`);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  const calls: unknown[][] = [], player = { currentTime: 5.6 };
  const context: any = {
    player, lastPositionRef: { current: 5.4 }, handledErrorQuality: { current: null }, selectedQuality: '1080p',
    selectedVideo: {}, selectedVoice: {}, isOffline: false, isLive: false, playerSaveQuality: false,
    getLowerQuality: () => '720p', getQualityFromStreams: (_video: unknown, quality: string) => quality,
    setPlaybackFailed() {}, setSelectedQuality() {}, setOverlayQuality() {}, updateTime() {},
    qualityOverlayRef: { current: { close() {} } }, NotificationStore: { displayMessage() {} },
    t: (value: string) => value,
    console: { error() {} }, updatePlayerStream: (...args: unknown[]) => calls.push(args),
  };
  const code = declarations.join('\n') + '\n globalThis.actions = {handlePlaybackError, handleQualityChange};';
  const compiled = ts.transpileModule(code,
    { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(compiled, context);

  return { ...context.actions, calls, player };
}

test('automatic quality recovery keeps progress before the first persisted checkpoint', () => {
  const player = actions(); player.handlePlaybackError(new Error('decoder failed'));
  assert.equal(player.calls[0][3], 5.6);
});

test('manual quality change does not restart a video that only just began', () => {
  const player = actions(); player.handleQualityChange({ value: '720p' });
  assert.equal(player.calls[0][3], 5.6);
});

test('a decoder that reset its clock to zero recovers the last progress event', () => {
  const player = actions(); player.player.currentTime = 0; player.handlePlaybackError(new Error('decoder failed'));
  assert.equal(player.calls[0][3], 5.4);
});
