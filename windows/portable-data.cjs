const fs = require('node:fs'), path = require('node:path'), { fileURLToPath } = require('node:url');
module.exports = root => {
  const locationFile = path.join(root, 'portable-location.json');
  let previous; try { previous = JSON.parse(fs.readFileSync(locationFile, 'utf8')).root; } catch {}
  const movePath = value => typeof previous === 'string' && (value.toLowerCase() === previous.toLowerCase() || value.toLowerCase().startsWith(previous.toLowerCase() + path.sep))
    ? root + value.slice(previous.length) : value;
  const relocate = value => {
    if (Array.isArray(value)) return value.map(relocate);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [movePath(key), relocate(item)]));
    if (typeof value !== 'string') return value;
    if (/^lumen-file:/.test(value)) { const url = new URL(value), raw = url.searchParams.get('path'); if (raw) url.searchParams.set('path', movePath(raw)); return url.href; }
    if (/^file:/.test(value)) { try { const raw = fileURLToPath(value), moved = movePath(raw); return moved === raw ? value : require('node:url').pathToFileURL(moved).href; } catch { return value; } }
    if (/^\s*[\[{]/.test(value)) { try { return JSON.stringify(relocate(JSON.parse(value))); } catch {} }
    return movePath(value);
  };
  if (typeof previous === 'string' && previous.toLowerCase() !== root.toLowerCase()) {
    for (const name of fs.readdirSync(root)) {
      if (!/^[a-zA-Z0-9_-]{1,64}\.json$/.test(name) || name === 'portable-location.json') continue;
      const file = path.join(root, name);
      try { const value = relocate(JSON.parse(fs.readFileSync(file, 'utf8'))); fs.writeFileSync(file + '.tmp', JSON.stringify(value)); fs.renameSync(file + '.tmp', file); }
      catch {} // One damaged store must not prevent the other stores from opening.
    }
  }
  fs.writeFileSync(locationFile, JSON.stringify({ root }));
};
