// A synthetic local BitTorrent seed exercises the real engine without third-party media.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const http = require('node:http'), crypto = require('node:crypto');
const { createTorrentEngine, settings } = require('../windows/torrent.cjs');
Object.assign(settings, { EnableDebug: false, DisableDHT: true, DisableUTP: true, ResponsiveMode: true });
const encode = value => {
  if (Buffer.isBuffer(value)) return Buffer.concat([Buffer.from(value.length + ':'), value]);
  if (typeof value === 'string') return encode(Buffer.from(value));
  if (typeof value === 'number') return Buffer.from('i' + value + 'e');
  if (Array.isArray(value)) return Buffer.concat([Buffer.from('l'), ...value.map(encode), Buffer.from('e')]);
  return Buffer.concat([Buffer.from('d'), ...Object.keys(value).sort().flatMap(key => [encode(key), encode(value[key])]), Buffer.from('e')]);
};
(async () => {
  const clip = fs.readFileSync(process.argv[2]);
  const filename = 'clip' + path.extname(process.argv[2]);
  const pieces = [];
  for (let offset = 0; offset < clip.length; offset += 16384) pieces.push(crypto.createHash('sha1').update(clip.subarray(offset, offset + 16384)).digest());
  const info = { name: filename, length: clip.length, 'piece length': 16384, pieces: Buffer.concat(pieces) };
  const hash = crypto.createHash('sha1').update(encode(info)).digest('hex');
  const sockets = new Set();
  const peer = require('node:net').createServer(socket => {

    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('error', () => {});
    let buffer = Buffer.alloc(0), handshaken = false;
        const hello = Buffer.concat([Buffer.from([19]), Buffer.from('BitTorrent protocol'), Buffer.alloc(8),
          Buffer.from(hash, 'hex'), Buffer.from('-LT0001-123456789012')]);
        socket.write(hello);
        const field = Buffer.alloc(Math.ceil(pieces.length / 8));
        for (let index = 0; index < pieces.length; index++) field[index >> 3] |= 1 << (7 - (index % 8));
        const header = Buffer.alloc(5); header.writeUInt32BE(1 + field.length); header[4] = 5;
        socket.write(Buffer.concat([header, field, Buffer.from([0,0,0,1,1])]));

    socket.on('data', chunk => {
      if (!handshaken && !buffer.length && chunk[0] !== 19) { socket.destroy(); return; }
      buffer = Buffer.concat([buffer, chunk]);
      if (!handshaken) {
        if (buffer.length < 68) return;
        buffer = buffer.subarray(68); handshaken = true;
      }
      while (buffer.length >= 4) {
        const length = buffer.readUInt32BE(0);
        if (buffer.length < 4 + length) return;
        const packet = buffer.subarray(4, 4 + length); buffer = buffer.subarray(4 + length);

        if (packet[0] !== 6 || packet.length !== 13) continue;
        const index = packet.readUInt32BE(1), offset = packet.readUInt32BE(5), size = packet.readUInt32BE(9);

        const data = clip.subarray(index * 16384 + offset, index * 16384 + offset + size);
        const header = Buffer.alloc(13); header.writeUInt32BE(9 + data.length); header[4] = 7;
        header.writeUInt32BE(index, 5); header.writeUInt32BE(offset, 9);
        socket.write(Buffer.concat([header, data]));
      }
    });
  });
  await new Promise(resolve => peer.listen(0, '127.0.0.1', resolve));
  const peerAddress = Buffer.from([127,0,0,1,0,0]); peerAddress.writeUInt16BE(peer.address().port,4);
  let torrent;
  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/announce')) {  res.end(encode({ interval: 3600, complete: 1, incomplete: 0, peers: peerAddress })); return; }
    const body = req.url.startsWith('/fixture.torrent') ? torrent : clip;
    const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    const start = Number(range?.[1] ?? 0), end = range?.[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
    res.writeHead(range ? 206 : 200, { 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes',
      'Content-Type': req.url.startsWith('/fixture.torrent') ? 'application/x-bittorrent' : 'video/mp4',
      ...(range ? { 'Content-Range': `bytes ${start}-${end}/${body.length}` } : {}) });
    res.end(body.subarray(start, end + 1));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  torrent = encode({ info, announce: base + '/announce' });
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-torrent-media-'));
  const engine = createTorrentEngine(root);
  try {

    const connection = await engine.start();

    const headers = { Authorization: connection.authorization, 'Content-Type': 'application/json' };
    const request = async (route, options = {}) => {
      const response = await fetch(connection.baseUrl + route, { ...options, headers: { ...headers, ...options.headers }, signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw Error(route + ': HTTP ' + response.status + ' ' + (await response.text()).slice(0,200));
      return response;
    };

    await request('/torrents', { method: 'POST', body: JSON.stringify({ action: 'add', link: base + '/fixture.torrent', save_to_db: false }) });
    let status;
    for (let attempt = 0; attempt < 30; attempt++) {
      status = await (await request('/torrents', { method: 'POST', body: JSON.stringify({ action: 'get', hash }) })).json();
      if (status.file_stats?.length) break;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    const index = status.file_stats?.find(file => file.path.endsWith(filename))?.id;
    if (!index) throw Error('File metadata missing');

    const configuration = await (await request('/settings', { method: 'POST', body: JSON.stringify({ action: 'get' }) })).json();
    const seedDelay = Number(process.env.LUMEN_TEST_SEED_DELAY_MS || 0);
    const seedTimer = setTimeout(() => peer.emit('connection',
      require('node:net').connect(configuration.PeersListenPort, '127.0.0.1')), seedDelay);
    const warming = Date.now();
    try {
      const preload = await (await request('/stream/' + filename + '?link=' + hash + '&index=' + index + '&preload=true&stat=true')).json();
      if (!preload.file_stats?.some(file => file.id === index)) throw Error('Preload lost selected file');
      if (Date.now() - warming < seedDelay - 100) throw Error('Preload returned before video was available');
    } finally { clearTimeout(seedTimer); }
    const raw = '/stream/' + filename + '?link=' + hash + '&index=' + index + '&play=true';
    const downloaded = Buffer.from(await (await request(raw)).arrayBuffer());
    if (!downloaded.equals(clip)) throw Error('Original download bytes differ');
    const range = await request(raw, { headers: { Range: 'bytes=100-199' } });
    if (range.status !== 206 || !Buffer.from(await range.arrayBuffer()).equals(clip.subarray(100,200))) throw Error('Seeking range failed');

    const master = await (await request(`/gst/${hash}/master.m3u8?index=${index}`)).text();
    if (!master.startsWith('#EXTM3U')) throw Error('HLS master invalid');
    const variantPath = master.split('\n').find(line => line && !line.startsWith('#'));
    const variant = await (await request(new URL(variantPath, connection.baseUrl + '/gst/' + hash + '/master.m3u8').pathname)).text();
    if (!variant.includes('#EXTINF')) throw Error('HLS variant missing segments');
    const segment = variant.split('\n').find(line => line && !line.startsWith('#'));
    const segmentURL = new URL(segment, connection.baseUrl + '/gst/' + hash + '/video.m3u8');
    const data = await (await request(segmentURL.pathname + segmentURL.search)).arrayBuffer();
    if (!data.byteLength) throw Error('HLS segment empty');
    console.log(JSON.stringify({ metadata: true, originalDownload: true, seeking: true, hls: true, segmentBytes: data.byteLength }));
  } catch (error) { console.log(engine.diagnostic()); throw error; } finally { engine.stop(); for (const socket of sockets) socket.destroy(); await new Promise(resolve => peer.close(resolve)); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
