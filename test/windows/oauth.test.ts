import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const registerOAuth = createRequire(import.meta.url)('../../windows/oauth.cjs');

test('Bundled Windows Google client opens browser without configuration and completes PKCE callback', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-oauth-'));
  const handlers = new Map<string, Function>(); let opened = 0; let exchange: URLSearchParams | undefined;
  fs.writeFileSync(path.join(root, 'bundled-client.json'), JSON.stringify({ installed: { client_id: 'test.apps.googleusercontent.com', client_secret: 'fixture-secret' } }));
  try {
    registerOAuth({
      bundledClientPath: path.join(root, 'bundled-client.json'),
      app: { getPath: (name: string) => name === 'userData' ? root : path.join(root, 'Lumen.exe') },
      safeStorage: { encryptString: (s: string) => Buffer.from(s), decryptString: (b: Buffer) => b.toString() },
      ipcMain: { on() {} }, assertSender() {}, handle: (name: string, fn: Function) => handlers.set(name, fn),
      dialog: { showOpenDialog: () => { throw new Error('Configuration must not be prompted again'); } },
      shell: { openExternal: async (value: string) => {
        opened++;
        const url = new URL(value);
        assert.equal(url.origin, 'https://accounts.google.com');
        assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
        assert.equal(url.searchParams.has('client_secret'), false);
        const callback = new URL(url.searchParams.get('redirect_uri')!);
        callback.searchParams.set('state', url.searchParams.get('state')!); callback.searchParams.set('code', 'fixture-code');
        assert.equal((await fetch(callback)).status, 200);
      } },
      session: { defaultSession: { fetch: async (url: string, options: { body: string }) => {
        if (url.includes('/token')) {
          exchange = new URLSearchParams(options.body);
          return { ok: true, json: async () => ({ access_token: 'fixture-token', refresh_token: 'fixture-refresh', expires_in: 3600 }) };
        }
        return { json: async () => ({ sub: 'fixture-user', email: 'test@example.com' }) };
      } } },
    });
    const result = await handlers.get('oauth:signin')!();
    assert.equal(result.type, 'success');
    assert.equal(opened, 1);
    assert.equal(exchange!.get('client_secret'), 'fixture-secret');
    assert.equal(exchange!.get('code_verifier')!.length, 43);
    assert.equal(fs.existsSync(path.join(root, 'windows-google.json')), false);
    assert.equal(fs.existsSync(path.join(root, 'google-oauth.bin')), true);
    assert.equal((await handlers.get('oauth:tokens')!()).accessToken, 'fixture-token');
  } finally { assert.ok(root.startsWith(path.join(os.tmpdir(), 'lumen-oauth-'))); fs.rmSync(root, { recursive: true, force: true }); }
});

test('First Windows Google setup owns the file dialog and announces why it is open', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumen-oauth-'));
  const handlers = new Map<string, Function>();
  const parent = { name: 'main-window' }; const phases: string[] = [];
  fs.writeFileSync(path.join(root, 'windows-google.json'), JSON.stringify({ clientId: '', clientSecret: '' }));
  try {
    registerOAuth({
      bundledClientPath: path.join(root, 'bundled-client.json'),
      app: { getPath: (name: string) => name === 'userData' ? root : path.join(root, 'Lumen.exe') },
      safeStorage: { encryptString: (s: string) => Buffer.from(s), decryptString: (b: Buffer) => b.toString() },
      ipcMain: { on() {} }, assertSender() {}, handle: (name: string, fn: Function) => handlers.set(name, fn),
      getWindow: () => parent, sendPhase: (phase: string) => phases.push(phase),
      dialog: { showOpenDialog: async (owner: unknown, options: { filters: unknown[] }) => {
        assert.equal(owner, parent); assert.ok(options.filters.length);
        assert.equal(phases.at(-1), 'setup');
        return { canceled: true };
      } },
      shell: { openExternal: () => { throw new Error('No browser before client import'); } },
      session: { defaultSession: { fetch: () => { throw new Error('No request before client import'); } } },
    });
    assert.equal((await handlers.get('oauth:signin')!()).type, 'cancelled');
    assert.deepEqual(phases, ['starting', 'setup']);
    assert.equal((await handlers.get('oauth:signin')!()).type, 'cancelled', 'cancellation releases the sign-in lock');
  } finally {
    assert.ok(root.startsWith(path.join(os.tmpdir(), 'lumen-oauth-')));
    fs.rmSync(root, { recursive: true, force: true });
  }
});
