const fs = require('node:fs'), path = require('node:path'), { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..'), output = path.join(root, 'dist', 'windows-portable');
const desktopClient = JSON.parse(fs.readFileSync(path.join(__dirname, 'google-desktop-client.json'), 'utf8')).installed;
if (!desktopClient || !/^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(desktopClient.client_id || '') || !desktopClient.client_secret) throw new Error('Windows release requires the registered Desktop OAuth client');
fs.mkdirSync(output, { recursive: true });
const stage = fs.mkdtempSync(path.join(root, 'dist', 'windows-stage-'));
const config = fs.readFileSync(path.join(__dirname, 'electron-builder.yml'), 'utf8');
if ((config.match(/^  output: .+$/gm) || []).length !== 1) throw new Error('Expected one build output directory');
const stagedConfig = path.join(stage, 'electron-builder.yml');
fs.writeFileSync(stagedConfig, config.replace(/^  output: .+$/m, '  output: ' + JSON.stringify(stage)));
const result = spawnSync(process.execPath, [path.join(__dirname, 'node_modules/electron-builder/cli.js'), '--projectDir', root, '--config', stagedConfig, '--win', 'portable'], { cwd: root, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
const artifact = 'Lumen-Windows-x64-Portable.exe';
const filename = process.argv[2] || artifact;
if (!/^Lumen-Windows-x64-Portable(?:-[A-Za-z0-9-]+)?\.exe$/.test(filename)) throw new Error('Invalid portable output filename');
const target = path.join(output, filename);
fs.copyFileSync(path.join(stage, artifact), target + '.next'); fs.renameSync(target + '.next', target);
console.log('Portable EXE: ' + target);
// Only the staging directory created by this invocation can be removed.
const resolvedStage = fs.realpathSync(stage), resolvedDist = fs.realpathSync(path.join(root, 'dist'));
if (!resolvedStage.startsWith(resolvedDist + path.sep) || !path.basename(resolvedStage).startsWith('windows-stage-')) throw new Error('Unsafe staging directory');
try { fs.rmSync(resolvedStage, { recursive: true, force: true, maxRetries: 3 }); }
catch { console.warn('Temporary build files remain in ' + resolvedStage); }
