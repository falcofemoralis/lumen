const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const settings = { CacheSize: 96 * 1024 * 1024, UseDisk: false, RemoveCacheOnDrop: true,
  TorrentDisconnectTimeout: 30, ConnectionsLimit: 20, PreloadCache: 10, ReaderReadAHead: 50,
  EnableDLNA: false, EnableBonjour: false, EnableLPD: false, DisableUPNP: true, EnableDebug: false, ResponsiveMode: true };
async function availablePeerPort() {
  for (let attempt = 0; attempt < 24; attempt++) {
    const port = 30000 + crypto.randomInt(15000);
    const tcp = require('node:net').createServer(), udp = require('node:dgram').createSocket('udp4');
    try {
      await new Promise((resolve, reject) => { tcp.once('error', reject); tcp.listen(port, '0.0.0.0', resolve); });
      await new Promise((resolve, reject) => { udp.once('error', reject); udp.bind(port, '0.0.0.0', resolve); });
      return port;
    } catch { /* Windows can reserve ports for virtual network adapters. */ }
    finally {
      if (tcp.listening) await new Promise(resolve => tcp.close(resolve));
      try { udp.close(); } catch { /* Not bound. */ }
    }
  }
  throw Error('No available TCP/UDP port for torrent playback');
}
function createTorrentEngine(root) {
  let child, pending, session, runtime, diagnostic = '';
  const stop = () => {
    session = undefined;
    if (child) { child.kill(); child = undefined; }
  };
  const start = () => {
    if (session && child && child.exitCode === null && !child.killed) return Promise.resolve(session);
    if (pending) return pending;
    pending = (async () => {
      const binary = path.join(__dirname, 'torrent-engine', 'TorrServer.exe');
      if (!fs.existsSync(binary)) throw Error('Torrent engine missing. Run node scripts/prepare-torrent-engine.cjs windows before packaging.');
      runtime = path.join(root, 'torrent-runtime');
      fs.mkdirSync(runtime, { recursive: true });
      const password = crypto.randomBytes(24).toString('hex');
      fs.writeFileSync(path.join(runtime, 'accs.db'), JSON.stringify({ lumen: password }));
      const peerPort = await availablePeerPort();
      fs.writeFileSync(path.join(runtime, 'settings.json'), JSON.stringify({ BitTorr: { ...settings, PeersListenPort: peerPort },
        gstreamer: { MaxTasks: 1, InactiveMinutes: 1, SegmentDiff: 3, SegmentSeconds: 6, Source: 'stream', GSTVersion: 1.28 } }));
      const listener = require('node:net').createServer();
      const port = await new Promise((resolve, reject) => {
        listener.once('error', reject);
        listener.listen(0, '127.0.0.1', () => { const port = listener.address().port; listener.close(() => resolve(port)); });
      });
      const connection = { baseUrl: 'http://127.0.0.1:' + port,
        authorization: 'Basic ' + Buffer.from('lumen:' + password).toString('base64'), hls: true };
      const spawned = spawn(binary, ['--ip', '127.0.0.1', '--port', String(port), '--path', runtime, '--httpauth'],
        { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GOMEMLIMIT: '192MiB' } });
      child = spawned;
      let launchError; diagnostic = '';
      const consume = chunk => { diagnostic = (diagnostic + chunk.toString()).slice(-2048); };
      spawned.stdout.on('data', consume); spawned.stderr.on('data', consume);
      spawned.once('error', error => { launchError = error; });
      spawned.once('exit', () => { if (child === spawned) { child = undefined; session = undefined; } });
      for (let attempt = 0; attempt < 100; attempt++) {
        if (launchError || spawned.exitCode !== null || spawned.killed) throw launchError || Error('Torrent engine stopped: ' + diagnostic.slice(-600));
        try {
          const response = await fetch(connection.baseUrl + '/echo', { headers: { Authorization: connection.authorization }, signal: AbortSignal.timeout(500) });
          if (response.ok) {
            session = connection;
            return connection;
          }
        } catch (error) { if (attempt === 99) throw error; }
        await delay(150);
      }
      throw Error('Torrent engine startup timeout');
    })().catch(error => { stop(); throw error; }).finally(() => { pending = undefined; });
    return pending;
  };
  return { start, stop, diagnostic: () => diagnostic };
}
module.exports = { createTorrentEngine, settings };
