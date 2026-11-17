const fs = require('node:fs'), path = require('node:path'), { pathToFileURL, fileURLToPath } = require('node:url');
module.exports = ({ app, ipcMain, dialog, shell, protocol, net, handle, assertSender }) => {
  const root = app.getPath('userData'), downloads = path.join(root, 'downloads'), cache = path.join(root, 'media-cache');
  fs.mkdirSync(downloads, { recursive: true }); fs.mkdirSync(cache, { recursive: true });
  const grantsPath = path.join(root, 'file-grants.json');
  let savedGrants = []; try { savedGrants = JSON.parse(fs.readFileSync(grantsPath, 'utf8')); } catch {}
  const granted = new Set([root, ...savedGrants.filter(value => typeof value === 'string' && path.isAbsolute(value))]);
  const grant = value => { granted.add(value); fs.writeFileSync(grantsPath, JSON.stringify([...granted])); return value; };
  const checkedPath = input => {
    const raw = String(input).startsWith('lumen-file:') ? new URL(input).searchParams.get('path') : input;
    const file = path.resolve(/^file:\/\/[a-z]:[\\/]/i.test(String(raw)) ? raw.slice(7) : String(raw).startsWith('file:') ? fileURLToPath(raw) : raw);
    const base = [...granted].find(base => file.toLowerCase() === base.toLowerCase() || file.toLowerCase().startsWith((base.endsWith(path.sep) ? base : base + path.sep).toLowerCase()));
    if (!base) throw new Error('File access has not been granted');
    return require('./path.cjs').portablePath(base, file);
  };
  ipcMain.on('paths', (event) => { assertSender(event); event.returnValue = { downloads, cache, data: root }; });
  ipcMain.on('file', (event, action, input, value) => {
    assertSender(event);
    try {
      const file = checkedPath(input);
      if (action === 'path') event.returnValue = file;
      else if (action === 'uri') event.returnValue = pathToFileURL(file).href;
      else if (action === 'list') event.returnValue = fs.readdirSync(file, { withFileTypes: true }).filter(item => !item.name.endsWith('.parts')).map(item => ({ path: path.join(file, item.name), directory: item.isDirectory() }));
      else if (action === 'mkdir') { fs.mkdirSync(file, { recursive: true }); event.returnValue = true; }
      else if (action === 'rmdir') { if ([root, downloads, cache, ...granted].some(base => base.toLowerCase() === file.toLowerCase())) throw new Error('Cannot remove a storage root'); fs.rmSync(file, { recursive: true, force: true }); event.returnValue = true; }
      else if (action === 'exists') event.returnValue = fs.existsSync(file);
      else if (action === 'read') event.returnValue = fs.readFileSync(file, 'utf8');
      else if (action === 'write') { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); event.returnValue = true; }
      else if (action === 'delete') { if (fs.existsSync(file)) fs.unlinkSync(file); const parts = checkedPath(file + '.parts'); if (fs.existsSync(parts)) fs.rmSync(parts, { recursive: true, force: true }); event.returnValue = true; }
      else if (action === 'size') {
        const parts = checkedPath(file + '.parts');
        event.returnValue = (fs.existsSync(file) ? fs.statSync(file).size : 0) + (fs.existsSync(parts) ? fs.readdirSync(parts, { withFileTypes: true }).filter(item => item.isFile()).reduce((total, item) => total + fs.statSync(path.join(parts, item.name)).size, 0) : 0);
      }
      else if (action === 'dash') { const fd = fs.openSync(file, 'r'), bytes = Buffer.alloc(1024); fs.readSync(fd, bytes, 0, bytes.length, 0); fs.closeSync(fd); event.returnValue = /<MPD\b/.test(bytes.toString()); }
      else if (action === 'hls') { const fd = fs.openSync(file, 'r'), bytes = Buffer.alloc(7); fs.readSync(fd, bytes, 0, 7, 0); fs.closeSync(fd); event.returnValue = bytes.toString() === '#EXTM3U'; }
    } catch (error) { event.returnValue = { error: error.message }; }
  });
  handle('file:choose', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile'] });
    if (result.canceled) return null;
    return grant(result.filePaths[0]);
  });
  handle('directory:choose', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
    if (result.canceled) return null;
    return grant(result.filePaths[0]);
  });
  handle('folder:open', input => shell.openPath(checkedPath(input)));
  protocol.handle('lumen-file', request => {
    try {
      const origin = request.headers.get('origin');
      if (origin && origin !== 'lumen://app') return new Response('', { status: 403 });
      const file = checkedPath(new URL(request.url).searchParams.get('path'));
      const fd = fs.openSync(file, 'r'), bytes = Buffer.alloc(7); fs.readSync(fd, bytes, 0, 7, 0); fs.closeSync(fd);
      if (/\.srt$/i.test(file)) return new Response('WEBVTT\n\n' + fs.readFileSync(file, 'utf8').replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2'), { headers: { 'Content-Type': 'text/vtt', 'Access-Control-Allow-Origin': '*' } });
      if (bytes.toString() === '#EXTM3U') {
        const localURI = uri => /^https?:/.test(uri) ? uri : 'lumen-file://app/?path=' + encodeURIComponent(checkedPath(path.resolve(path.dirname(file), uri)));
        const playlist = fs.readFileSync(file, 'utf8').split('\n').map(line =>
          line.trim() && !line.startsWith('#') ? localURI(line.trim())
            : line.replace(/URI="([^"]+)"/g, (_, uri) => 'URI="' + localURI(uri) + '"')).join('\n');
        return new Response(playlist, { headers: { 'Content-Type': 'application/vnd.apple.mpegurl', 'Access-Control-Allow-Origin': '*' } });
      }
      if (/\.mpd$/i.test(file) || bytes.toString().startsWith('<MPD') || bytes.toString().startsWith('<?xml')) {
        const doc = new (require('./xml.cjs').DOMParser)().parseFromString(fs.readFileSync(file, 'utf8'), 'application/xml');
        if (doc.documentElement.localName === 'MPD') {
          for (const [name, attr] of [['Initialization','sourceURL'], ['SegmentURL','media']]) {
            for (const element of Array.from(doc.getElementsByTagName(name))) {
              const uri = element.getAttribute(attr);
              if (uri && !/^https?:/.test(uri)) element.setAttribute(attr, 'lumen-file://app/?path=' + encodeURIComponent(checkedPath(path.resolve(path.dirname(file), uri))));
            }
          }
          return new Response(new (require('./xml.cjs').XMLSerializer)().serializeToString(doc), { headers: { 'Content-Type': 'application/dash+xml', 'Access-Control-Allow-Origin': '*' } });
        }
      }
      const size = fs.statSync(file).size, range = request.headers.get('range');
      const contentType = ({ '.mp4': 'video/mp4', '.webm': 'video/webm', '.mkv': 'video/x-matroska', '.ts': 'video/mp2t', '.vtt': 'text/vtt', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' })[path.extname(file).toLowerCase()] || 'application/octet-stream';
      let start = 0, end = size - 1;
      if (range) {
        const match = range.match(/^bytes=(\d*)-(\d*)$/);
        if (!match) return new Response('', { status: 416 });
        if (match[1]) { start = Number(match[1]); end = match[2] ? Math.min(end, Number(match[2])) : end; }
        else start = Math.max(0, size - Number(match[2]));
        if (start > end || start >= size) return new Response('', { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
      }
      const headers = { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Length': String(Math.max(0,end-start+1)), 'Access-Control-Allow-Origin': '*' };
      if (range) headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + size;
      return new Response(request.method === 'HEAD' || size === 0 ? null : require('node:stream').Readable.toWeb(fs.createReadStream(file, { start, end })),
        { status: range ? 206 : 200, headers });
    }
    catch { return new Response('', { status: 403 }); }
  });
  return { checkedPath };
};
