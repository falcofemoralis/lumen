const { spawnSync } = require('node:child_process');
const path = require('node:path');
const expo = require.resolve('@expo/cli');
const result = spawnSync(process.execPath, [expo, 'export', '--platform', 'web', '--output-dir', path.join('windows', 'web')], {
  cwd: path.resolve(__dirname, '..'), stdio: 'inherit',
  env: { ...process.env, EXPO_NO_TELEMETRY: '1' }
});
if (result.status === 0) {
  require('esbuild').buildSync({ entryPoints: [require.resolve('@xmldom/xmldom')], bundle: true, platform: 'node', outfile: path.join(__dirname, 'xml.cjs') });
  const fs = require('node:fs'), file = path.join(__dirname, 'web/index.html');
  fs.copyFileSync(path.join(__dirname, '../assets/images/app-icon-all.png'), path.join(__dirname, 'web/lumen-icon.png'));
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace('<head>', '<head><link rel="icon" type="image/png" href="./lumen-icon.png">');
  html = html.replace('<head>', '<head><meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' https: http: data: blob: lumen-file:; connect-src \'self\' https: http: lumen-media: lumen-file:; media-src \'self\' blob: lumen-media: lumen-file:; worker-src \'self\' blob:; frame-src https: http:; font-src \'self\' data:">');
  fs.writeFileSync(file, html);
}
process.exit(result.status ?? 1);
