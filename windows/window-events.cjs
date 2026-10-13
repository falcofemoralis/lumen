/** Renderer delivery can arrive after a download, OAuth or child window outlives the main window. */
module.exports = getWindow => (channel, ...args) => {
  try {
    const window = getWindow();
    if (!window || window.isDestroyed()) return false;
    const contents = window.webContents;
    if (!contents || contents.isDestroyed()) return false;
    contents.send(channel, ...args);
    return true;
  } catch (error) {
    if (/destroyed/i.test(error?.message || '')) return false;
    throw error;
  }
};
