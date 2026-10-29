const http = require('node:http'), crypto = require('node:crypto'), fs = require('node:fs'), path = require('node:path');
module.exports = ({ app, shell, safeStorage, handle, ipcMain, assertSender, session, dialog = require('electron').dialog, getWindow, sendPhase = () => {}, bundledClientPath }) => {
  const file = path.join(app.getPath('userData'), 'google-oauth.bin');
  let auth = null;
  try { auth = JSON.parse(safeStorage.decryptString(fs.readFileSync(file))); } catch {}
  const persist = () => { if (auth) fs.writeFileSync(file, safeStorage.encryptString(JSON.stringify(auth))); else if (fs.existsSync(file)) fs.unlinkSync(file); };
  const tokens = async params => {
    const response = await session.defaultSession.fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params).toString() });
    const result = await response.json(); if (!response.ok) throw new Error(result.error_description || result.error || 'Google OAuth failed'); return result;
  };
  ipcMain.on('oauth:current', event => { assertSender(event); event.returnValue = auth ? { user: auth.user } : null; });
  const configFile = path.join(app.getPath('userData'), 'google-client.bin');
  const validate = input => {
    const config = input.installed ? { clientId: input.installed.client_id, clientSecret: input.installed.client_secret } : input;
    if (!/^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(config.clientId || '')) throw new Error('Выберите JSON OAuth-клиента типа Desktop app');
    if (input.web) throw new Error('Нужен OAuth-клиент типа Desktop app, а не Web application');
    return { clientId: config.clientId, ...(config.clientSecret ? { clientSecret: config.clientSecret } : {}) };
  };
  const resolveConfig = async () => {
    if (auth?.clientId) return validate(auth);
    const bundled = bundledClientPath ?? path.join(__dirname, 'google-desktop-client.json');
    // A release includes its registered Desktop client. Obsolete manual
    // Windows settings must not override this with the Android Web client ID.
    if (fs.existsSync(bundled)) return validate(JSON.parse(fs.readFileSync(bundled, 'utf8')));
    if (fs.existsSync(configFile)) { try { return validate(JSON.parse(safeStorage.decryptString(fs.readFileSync(configFile)))); } catch { /* A copied DPAPI file requires importing the client on this computer. */ } }
    // Support the previously saved desktop configuration and optional
    // developer-provided Desktop client beside the executable.
    const legacy = path.join(app.getPath('userData'), 'windows-google.json');

    const portable = path.join(process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(app.getPath('exe')), 'google-desktop-client.json');
    let config;
    for (const candidate of [legacy, bundled, portable]) {
      if (!fs.existsSync(candidate)) continue;
      try { config = validate(JSON.parse(fs.readFileSync(candidate, 'utf8'))); break; }
      catch { /* Empty or obsolete setup must not prevent choosing a valid Desktop JSON. */ }
    }
    if (!config) {

      sendPhase('setup');
      const options = {
        title: 'Однократная настройка: выберите JSON Desktop OAuth-клиента Lumen из Google Cloud',
        properties: ['openFile'], filters: [{ name: 'Google Desktop OAuth client', extensions: ['json'] }]
      };
      const parent = getWindow?.();
      const selected = await (parent ? dialog.showOpenDialog(parent, options) : dialog.showOpenDialog(options));
      if (selected.canceled) return null;
      const parsed = JSON.parse(fs.readFileSync(selected.filePaths[0], 'utf8'));
      if (!parsed.installed) throw new Error('В JSON должен быть Desktop OAuth-клиент (installed), а не Web-клиент');
      config = validate(parsed);
    }
    fs.writeFileSync(configFile, safeStorage.encryptString(JSON.stringify(config)));
    if (fs.existsSync(legacy)) fs.unlinkSync(legacy);
    return config;
  };
  let signingIn = false;
  handle('oauth:signin', async () => {
    if (signingIn) throw new Error('Вход Google уже открыт в браузере');
    signingIn = true;
    sendPhase('starting');
    try {
    const config = await resolveConfig();
    if (!config) return { type: 'cancelled' };
    if (!/^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(config.clientId)) throw new Error('Укажите OAuth client ID типа Desktop app');
    const verifier = crypto.randomBytes(32).toString('base64url'), state = crypto.randomBytes(24).toString('hex');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    let redirect;
    const result = await new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, redirect);
        if (url.pathname !== '/callback') { res.writeHead(404).end(); return; }
        if (url.searchParams.get('state') !== state) { res.writeHead(403).end(); return; }
        res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end('<body style="background:#000;color:white;font:18px Segoe UI">Lumen: ответ Google получен. Вернитесь в приложение для завершения входа.</body>');
        clearTimeout(timer); server.close();
        if (!url.searchParams.get('code')) { reject(new Error('Google sign-in cancelled')); return; }
        try { resolve(await tokens({ client_id: config.clientId, ...(config.clientSecret ? { client_secret: config.clientSecret } : {}), code: url.searchParams.get('code'), code_verifier: verifier, redirect_uri: redirect, grant_type: 'authorization_code' })); }
        catch (error) { reject(error); }
      });
      const timer = setTimeout(() => { server.close(); reject(new Error('Google sign-in timed out')); }, 180000);
      server.listen(0, '127.0.0.1', () => {
        redirect = 'http://127.0.0.1:' + server.address().port + '/callback';
        const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        url.search = new URLSearchParams({ client_id: config.clientId, redirect_uri: redirect, response_type: 'code', scope: 'openid email profile https://www.googleapis.com/auth/drive.appdata', access_type: 'offline', prompt: 'consent', state, code_challenge: challenge, code_challenge_method: 'S256' }).toString();
        sendPhase('browser');
        shell.openExternal(url.href).catch(error => { clearTimeout(timer); server.close(); reject(error); });
      });
      server.on('error', error => { clearTimeout(timer); reject(error); });
    });
    const profile = await (await session.defaultSession.fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: 'Bearer ' + result.access_token } })).json();
    auth = { ...config, ...result, expiresAt: Date.now() + result.expires_in * 1000, user: { id: profile.sub, email: profile.email, name: profile.name, photo: profile.picture } };
    persist(); return { type: 'success', data: { user: auth.user } };
    } finally { signingIn = false; }
  });
  handle('oauth:tokens', async () => {
    if (!auth) throw new Error('Google Drive is not connected');
    if (Date.now() >= auth.expiresAt - 60000) {
      const refreshed = await tokens({ client_id: auth.clientId, ...(auth.clientSecret ? { client_secret: auth.clientSecret } : {}), refresh_token: auth.refresh_token, grant_type: 'refresh_token' });
      auth = { ...auth, ...refreshed, expiresAt: Date.now() + refreshed.expires_in * 1000 }; persist();
    }
    return { accessToken: auth.access_token, idToken: auth.id_token };
  });
  handle('oauth:invalidate', () => { if (auth) auth.expiresAt = 0; });
  handle('oauth:signout', () => { auth = null; persist(); });
};
