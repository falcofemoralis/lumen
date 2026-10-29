import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const createMiniWindow = require('../../windows/mini-window.cjs');

test('Desktop mini player restores the original window and remembers its last position', async () => {
  const dataRoot = mkdtempSync(join(tmpdir(), 'lumen-mini-'));
  class Window extends EventEmitter {
    bounds = { x: 80, y: 50, width: 1280, height: 850 };
    minimum = [800, 550]; top = false;
    isDestroyed() { return false; }
    getBounds() { return { ...this.bounds }; }
    getNormalBounds() { return this.getBounds(); }
    isMaximized() { return false; }
    isFullScreen() { return false; }
    isAlwaysOnTop() { return this.top; }
    getMinimumSize() { return this.minimum; }
    setMinimumSize(...size: number[]) { this.minimum = size; }
    setBounds(bounds: any) { this.bounds = bounds; }
    topLevel?: string;
    setAlwaysOnTop(value: boolean, level?: string) { this.top = value; this.topLevel = level; }
  }
  const window = new Window();
  const screen = { getDisplayMatching: () => ({ workArea: { x: 0, y: 0, width: 1920, height: 1040 } }) };
  try {
    const action = createMiniWindow({ window, screen, dataRoot });
    assert.equal(await action('maximize'), false);
    await action('mini-enter');
    assert.equal(window.bounds.width, 480);
    assert.deepEqual(window.minimum, [240, 135]);
    assert.equal(window.top, true);
    assert.equal(window.topLevel, 'screen-saver');
    window.bounds.x = 340; window.bounds.y = 210;
    await action('mini-exit');
    assert.deepEqual(window.bounds, { x: 80, y: 50, width: 1280, height: 850 });
    assert.equal(window.top, false);
    assert.equal(JSON.parse(readFileSync(join(dataRoot, 'mini-window.json'), 'utf8')).x, 340);
    await action('mini-enter');
    assert.equal(window.bounds.x, 340);
    assert.equal(window.bounds.y, 210);
    await action('mini-exit');
  } finally { rmSync(dataRoot, { recursive: true, force: true }); }
});

test('Remembered mini player remains visible after disconnecting a monitor', () => {
  assert.deepEqual(createMiniWindow.visibleBounds({ x: 9000, y: -500, width: 480, height: 270 },
    { x: 0, y: 0, width: 1280, height: 720 }), { x: 800, y: 0, width: 480, height: 270 });
});