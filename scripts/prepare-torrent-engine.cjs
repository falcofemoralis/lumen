const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const VERSION = 'MatriX.147.2';
const ASSETS = {
  windows: ['TorrServer-gst-windows-amd64.exe', 'b0248806b567426be553f4925ade19766b4536d456689c7036da3e9c615b3f36'],
  'arm64-v8a': ['TorrServer-android-arm64', '52e365deb5e80d97b31fe67cc04a269cc7e750b906c42d28cee735d95bbbd02c'],
  'armeabi-v7a': ['TorrServer-android-arm7', 'be10bc7d073487fafc8d076774c4dabf517d13740f8c638aac920093fd7898cc'],
  x86: ['TorrServer-android-386', '5a8b7def61731c96556fbbe137175f10322f6f4576676730cc98c45f4b842634'],
  x86_64: ['TorrServer-android-amd64', '1a77717d960067c4c451494f3423aa31101d6deb7874d502ff5758e24cfbeb4b'],
};
async function digest(file) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}
async function prepare(target) {
  if (!ASSETS[target]) throw Error('Unsupported torrent engine target');
  const [asset, expected] = ASSETS[target];
  const root = path.resolve(__dirname, '..');
  const file = target === 'windows' ? path.join(root, 'windows', 'torrent-engine', 'TorrServer.exe')
    : path.join(root, 'modules/react-native-torrent/android/build/generated/torrserver', target, 'libtorrserver.so');
  if (fs.existsSync(file) && await digest(file) === expected) return file;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  console.log('Preparing optional torrent engine: ' + target);
  const response = await fetch(`https://github.com/YouROK/TorrServer/releases/download/${VERSION}/${asset}`,
    { signal: AbortSignal.timeout(180000) });
  if (!response.ok || !response.body) throw Error('Torrent engine download failed: ' + response.status);
  const temporary = file + '.partial-' + process.pid;
  try {
    const output = fs.createWriteStream(temporary);
    await require('node:stream/promises').pipeline(require('node:stream').Readable.fromWeb(response.body), output);
    if (await digest(temporary) !== expected) throw Error('Torrent engine checksum mismatch');
    fs.renameSync(temporary, file);
  } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  return file;
}
module.exports = { prepare, digest, ASSETS, VERSION };
if (require.main === module) (async () => {
  const targets = process.argv.slice(2);
  if (!targets.length) throw Error('Specify windows or Android ABIs');
  for (const target of targets) await prepare(target);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
