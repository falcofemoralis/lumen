const fs = require('node:fs'), path = require('node:path');
async function saveHls(url, destination, fetch, { signal, onProgress = () => {} } = {}) {
  let response = await fetch(url, { signal }), text = await response.text();
  if (!response.ok || !text.startsWith('#EXTM3U')) throw new Error('Invalid HLS playlist');
  // A selected media playlist is preferred. Master playlists resolve to their
  // highest advertised rendition, then only that rendition is saved.
  for (let depth = 0; text.includes('#EXT-X-STREAM-INF:') && depth < 8; depth++) {
    const lines = text.split(/\r?\n/), variants = [];
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('#EXT-X-STREAM-INF:') && lines[i + 1])
      variants.push({ url: new URL(lines[i + 1], url).href, bandwidth: Number(lines[i].match(/BANDWIDTH=(\d+)/)?.[1]) || 0 });
    variants.sort((a,b) => b.bandwidth-a.bandwidth);
    if (!variants[0]) throw new Error('Empty HLS master playlist');
    url = variants[0].url; response = await fetch(url, { signal }); text = await response.text();
    if (!response.ok || !text.startsWith('#EXTM3U')) throw new Error('Invalid HLS rendition');
  }
  if (text.includes('#EXT-X-STREAM-INF:')) throw new Error('Nested HLS master limit exceeded');
  const directory = destination + '.parts';
  fs.mkdirSync(directory, { recursive: true });
  const resources = new Map();
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) resources.set(new URL(line.trim(), url).href, '');
    for (const match of line.matchAll(/URI="([^"]+)"/g)) resources.set(new URL(match[1], url).href, '');
  }
  let index = 0, bytes = 0;
  for (const resource of resources.keys()) {
    signal?.throwIfAborted();
    const extension = path.extname(new URL(resource).pathname).replace(/[^a-zA-Z0-9.]/g, '') || '.bin';
    const name = 'resource-' + index++ + extension, file = path.join(directory, name);
    if (!fs.existsSync(file)) {
      const result = await fetch(resource, { signal });
      if (!result.ok) throw new Error('HLS resource HTTP ' + result.status);
      const content = Buffer.from(await result.arrayBuffer());
      fs.writeFileSync(file + '.tmp', content); fs.renameSync(file + '.tmp', file);
    }
    bytes += fs.statSync(file).size;
    resources.set(resource, path.basename(directory) + '/' + name);
    onProgress({ bytesDownloaded: bytes, bytesTotal: Math.ceil(bytes / index * resources.size) });
  }
  const playlist = lines.map(line => {
    if (line.trim() && !line.startsWith('#')) return resources.get(new URL(line.trim(), url).href);
    return line.replace(/URI="([^"]+)"/g, (_, uri) => 'URI="' + resources.get(new URL(uri, url).href) + '"');
  }).join('\n');
  fs.writeFileSync(destination + '.partial', playlist);
  fs.renameSync(destination + '.partial', destination);
  return { bytesDownloaded: bytes, bytesTotal: bytes };
}
module.exports = { saveHls };
