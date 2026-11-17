const fs = require('node:fs'), path = require('node:path');
function visibleBounds(saved, area) {
  const width = Math.min(area.width, Math.max(240, Number.isFinite(saved?.width) ? Math.round(saved.width) : 480));
  const height = Math.min(area.height, Math.max(135, Number.isFinite(saved?.height) ? Math.round(saved.height) : 270));
  return { width, height,
    x: Math.max(area.x, Math.min(area.x + area.width - width, Number.isFinite(saved?.x) ? Math.round(saved.x) : area.x + area.width - width - 24)),
    y: Math.max(area.y, Math.min(area.y + area.height - height, Number.isFinite(saved?.y) ? Math.round(saved.y) : area.y + area.height - height - 24)) };
}
module.exports = function miniWindow({ window, screen, dataRoot }) {
  const file = path.join(dataRoot, 'mini-window.json');
  let previous, timer, busy = false;
  const save = () => {
    if (!previous || window.isDestroyed()) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!previous || window.isDestroyed()) return;
      try { fs.writeFileSync(file, JSON.stringify(window.getBounds())); } catch {}
    }, 150);
  };
  window.on('moved', save); window.on('resized', save);
  window.on('closed', () => clearTimeout(timer));
  return async action => {
    if (!['mini-enter','mini-exit'].includes(action)) return false;
    if (busy || window.isDestroyed()) return true;
    busy = true;
    try {
      if (action === 'mini-enter' && !previous) {
        const original = { bounds: window.getNormalBounds(), maximized: window.isMaximized(), fullscreen: window.isFullScreen(), minimum: window.getMinimumSize(), top: window.isAlwaysOnTop() };
        if (original.fullscreen) {
          await new Promise((resolve, reject) => {
            const done = () => { clearTimeout(timeout); resolve(); };
            const timeout = setTimeout(() => { window.removeListener('leave-full-screen', done); reject(new Error('Could not leave fullscreen')); }, 3000);
            window.once('leave-full-screen', done); window.setFullScreen(false);
          });
        }
        if (window.isDestroyed()) return true;
        if (original.maximized) window.unmaximize();
        let saved;
        try { saved = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
        const display = saved && Number.isFinite(saved.x) && Number.isFinite(saved.y)
          ? screen.getDisplayMatching({ x: saved.x, y: saved.y, width: 480, height: 270 })
          : screen.getDisplayMatching(original.bounds);
        window.setMinimumSize(240, 135);
        window.setBounds(visibleBounds(saved, display.workArea), false);
        window.setAlwaysOnTop(true, 'screen-saver');
        previous = original;
      } else if (action === 'mini-exit' && previous) {
        clearTimeout(timer);
        try { fs.writeFileSync(file, JSON.stringify(window.getBounds())); } catch {}
        const original = previous; previous = null;
        window.setAlwaysOnTop(original.top);
        window.setMinimumSize(...original.minimum);
        if (original.maximized) window.maximize();
        else window.setBounds(original.bounds, false);
        if (original.fullscreen) window.setFullScreen(true);
      }
      return true;
    } finally { busy = false; }
  };
};
module.exports.visibleBounds = visibleBounds;