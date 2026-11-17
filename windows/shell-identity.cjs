const APP_ID = 'com.falcofemoralis.lumen.windows';
const path = require('node:path');
exports.APP_ID = APP_ID;
exports.windowDetails = executable => ({
  appId: APP_ID, relaunchCommand: '"' + executable + '"', relaunchDisplayName: 'Lumen',
  appIconPath: executable, appIconIndex: 0,
});
exports.ensureShortcut = ({ shell, fs, executable, root }) => {
  const shortcut = path.join(root, 'Lumen.lnk');
  if (fs.existsSync(shortcut)) {
    let existing;
    try { existing = shell.readShortcutLink(shortcut); } catch { return false; }
    // Preserve unrelated user-created shortcuts.
    if (existing.appUserModelId !== APP_ID) return false;
  }
  return shell.writeShortcutLink(shortcut, 'create', {
    target: executable, cwd: path.dirname(executable), icon: executable, iconIndex: 0,
    appUserModelId: APP_ID, description: 'Lumen',
  });
};