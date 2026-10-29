import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const identity = createRequire(import.meta.url)('../../windows/shell-identity.cjs');

test('Windows shortcut and window share identity, stable executable and icon', () => {
  let written: any;
  const executable = 'D:\\Apps\\Lumen\\Lumen.exe';
  const shell = { writeShortcutLink: (_path: string, _operation: string, options: unknown) => { written = options; return true; } };
  assert.equal(identity.ensureShortcut({ shell, fs: { existsSync: () => false }, executable, root: 'D:\\Apps\\Lumen' }), true);
  const details = identity.windowDetails(executable);
  assert.equal(written.appUserModelId, details.appId);
  assert.equal(written.target, executable);
  assert.equal(written.icon, details.appIconPath);
  assert.equal(details.relaunchCommand, '"' + executable + '"');
});
test('Windows startup preserves foreign shortcuts and refreshes its own shortcut', () => {
  let writes = 0;
  const shell = { readShortcutLink: () => ({ appUserModelId: 'other.app' }), writeShortcutLink: () => { writes++; return true; } };
  const args = { shell, fs: { existsSync: () => true }, executable: 'D:\\Apps\\Lumen.exe', root: 'D:\\Apps' };
  assert.equal(identity.ensureShortcut(args), false); assert.equal(writes, 0);
  shell.readShortcutLink = () => ({ appUserModelId: identity.APP_ID });
  assert.equal(identity.ensureShortcut(args), true); assert.equal(writes, 1);
});