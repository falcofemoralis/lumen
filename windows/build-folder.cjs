// Folder portable distribution: the dock launches the actual executable at a stable path.
const fs = require('node:fs'), path = require('node:path'), { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const folderName = process.argv[2] || 'Lumen';
if (!/^Lumen(?:-[A-Za-z0-9-]+)?$/.test(folderName)) throw new Error('Invalid folder name');
const target = path.join(root, 'dist', 'windows', folderName);
if (fs.existsSync(target)) throw new Error('Output already exists: ' + target + '. Keep the existing app/data; choose a new output folder before rebuilding.');
const client = JSON.parse(fs.readFileSync(path.join(__dirname, 'google-desktop-client.json'), 'utf8')).installed;
if (!client?.client_id || !client?.client_secret) throw new Error('Windows build requires the local Desktop OAuth client');
fs.mkdirSync(path.dirname(target), { recursive: true });
const stage = fs.mkdtempSync(path.join(root, 'dist', 'windows-stage-folder-'));
const config = fs.readFileSync(path.join(__dirname, 'electron-builder.yml'), 'utf8');
if ((config.match(/^  output: .+$/gm) || []).length !== 1) throw new Error('Expected one output directory');
const stagedConfig = path.join(stage, 'electron-builder.yml');
fs.writeFileSync(stagedConfig, config.replace(/^  output: .+$/m, '  output: ' + JSON.stringify(stage)));
const result = spawnSync(process.execPath, [path.join(__dirname, 'node_modules/electron-builder/cli.js'), '--projectDir', root, '--config', stagedConfig, '--win', '--dir'], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
const unpacked = path.join(stage, 'win-unpacked');
if (!fs.existsSync(path.join(unpacked, 'Lumen.exe'))) throw new Error('Folder build did not produce Lumen.exe');
fs.renameSync(unpacked, target);
console.log('Folder portable EXE: ' + path.join(target, 'Lumen.exe'));
// Keep the tiny staging diagnostics; never delete or overwrite an existing app/data folder.