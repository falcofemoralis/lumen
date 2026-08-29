// Zipaligns and signs every APK produced by `npm run build`.
//
// With ABI splits enabled (plugins/withAbiSplits.js) Gradle emits
// app-<abi>-release.apk for each architecture plus app-universal-release.apk,
// so signing a single hardcoded app-release.apk is no longer enough.
//
// The keystore password is resolved in this order:
//   1. LUMEN_KEYSTORE_PASSWORD          (real env var, or .env.local / .env)
//   2. LUMEN_KEYSTORE_PASSWORD_FILE     (path to a file whose first line is it)
//   3. an interactive prompt
// so it is asked for at most once per run. Both env files are gitignored.
// Optional overrides: LUMEN_KEYSTORE, LUMEN_KEY_ALIAS.
//
// Signed APKs land in dist/ as lumen-<abi>.apk.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APK_DIR = path.join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'release');
const OUT_DIR = path.join(ROOT, 'dist');
const ENV_FILES = ['.env.local', '.env'];

// Windows keeps zipalign/apksigner next to the project, everywhere else they
// are expected on PATH.
const localTool = (name) => (existsSync(path.join(ROOT, name)) ? path.join(ROOT, name) : null);
const ZIPALIGN = localTool('zipalign.exe') ?? 'zipalign';
const APKSIGNER = localTool('apksigner.bat') ?? 'apksigner';

const quote = (value) => (/\s/.test(value) ? `"${value}"` : value);

// shell: true is required because apksigner ships as a .bat on Windows.
const run = (command, args, input) => spawnSync(
  quote(command),
  args.map(quote),
  { cwd: ROOT, shell: true, input, stdio: ['pipe', 'inherit', 'inherit'] }
);

/** Minimal KEY=VALUE reader - enough for a handful of build secrets. */
const readEnvFile = (file) => {
  const env = {};

  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([\w.-]+)\s*=\s*(.*)$/.exec(line);

    if (!match || line.trimStart().startsWith('#')) {
      continue;
    }

    env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }

  return env;
};

const loadEnv = () => {
  const fromFiles = ENV_FILES
    .map((name) => path.join(ROOT, name))
    .filter(existsSync)
    // Earlier files win, and a real env var wins over both.
    .reduceRight((env, file) => ({ ...env, ...readEnvFile(file) }), {});

  return { ...fromFiles, ...process.env };
};

const promptPassword = (label) => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY) {
    reject(new Error(
      'No keystore password found and no TTY to ask for one. '
      + 'Set LUMEN_KEYSTORE_PASSWORD in .env.local.'
    ));

    return;
  }

  process.stdout.write(label);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  let password = '';

  const done = (error, value) => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.off('data', onData);
    process.stdout.write('\n');

    if (error) {
      reject(error);
    } else {
      resolve(value);
    }
  };

  const onData = (chunk) => {
    for (const char of chunk) {
      const code = char.charCodeAt(0);

      // CR / LF / EOT - the password is complete.
      if (code === 13 || code === 10 || code === 4) {
        done(null, password);

        return;
      }

      // Ctrl+C.
      if (code === 3) {
        done(new Error('Aborted.'));

        return;
      }

      // Backspace / DEL.
      if (code === 8 || code === 127) {
        password = password.slice(0, -1);
      } else {
        password += char;
      }
    }
  };

  process.stdin.on('data', onData);
});

const resolvePassword = async (env, keystore) => {
  if (env.LUMEN_KEYSTORE_PASSWORD) {
    console.log('Using keystore password from LUMEN_KEYSTORE_PASSWORD.');

    return env.LUMEN_KEYSTORE_PASSWORD;
  }

  const file = env.LUMEN_KEYSTORE_PASSWORD_FILE;

  if (file) {
    const resolved = path.resolve(ROOT, file);

    if (!existsSync(resolved)) {
      throw new Error(`LUMEN_KEYSTORE_PASSWORD_FILE points at a missing file: ${resolved}`);
    }

    const password = readFileSync(resolved, 'utf8').split(/\r?\n/)[0].trim();

    if (!password) {
      throw new Error(`${file} is empty - its first line must be the keystore password.`);
    }

    console.log(`Using keystore password from ${file}.`);

    return password;
  }

  return promptPassword(`Keystore password for ${keystore}: `);
};

const main = async () => {
  const env = loadEnv();
  const keystore = env.LUMEN_KEYSTORE ?? 'lumen.keystore';
  const keyAlias = env.LUMEN_KEY_ALIAS ?? 'lumen';

  if (!existsSync(path.resolve(ROOT, keystore))) {
    throw new Error(`Keystore not found: ${keystore}`);
  }

  if (!existsSync(APK_DIR)) {
    throw new Error(`No release output at ${APK_DIR}. Run "npm run build" first.`);
  }

  const apks = readdirSync(APK_DIR)
    .map((file) => ({ file, match: /^app-(.+-)?release\.apk$/.exec(file) }))
    .filter(({ match }) => match !== null)
    .map(({ file, match }) => ({
      input: path.join(APK_DIR, file),
      // app-arm64-v8a-release.apk -> lumen-arm64-v8a.apk, app-release.apk -> lumen.apk
      output: path.join(OUT_DIR, `lumen${match[1] ? `-${match[1].slice(0, -1)}` : ''}.apk`),
    }));

  if (apks.length === 0) {
    throw new Error(`No release APKs found in ${APK_DIR}.`);
  }

  console.log(`Signing ${apks.length} APK(s) from ${path.relative(ROOT, APK_DIR)}`);

  const password = await resolvePassword(env, keystore);

  mkdirSync(OUT_DIR, { recursive: true });

  for (const { input, output } of apks) {
    console.log(`\n> ${path.basename(input)} -> ${path.relative(ROOT, output)}`);

    const aligned = run(ZIPALIGN, ['-f', '4', input, output]);

    if (aligned.status !== 0) {
      throw new Error(`zipalign failed for ${path.basename(input)}.`);
    }

    // The password goes over stdin so it never lands in the process arguments.
    const signed = run(
      APKSIGNER,
      ['sign', '--ks', keystore, '--ks-key-alias', keyAlias, '--ks-pass', 'stdin', output],
      `${password}\n`
    );

    if (signed.status !== 0) {
      throw new Error(`apksigner failed for ${path.basename(output)}.`);
    }

    const verified = run(APKSIGNER, ['verify', output]);

    if (verified.status !== 0) {
      throw new Error(`Signature verification failed for ${path.basename(output)}.`);
    }
  }

  console.log(`\nDone. Signed APKs are in ${path.relative(ROOT, OUT_DIR)}/`);
};

main().catch((error) => {
  console.error(`\n${error.message}`);
  process.exit(1);
});
