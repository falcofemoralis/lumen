module.exports = ({ session, handle, manualFetch = require('./manual-fetch.cjs') }) => {
  const pending = new Map();
  handle('fetch:abort', id => { const controller = pending.get(id); controller?.abort(); return !!controller; });
  handle('fetch', async ({ requestId, url, method, headers, body, redirect, credentials }) => {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported URL');
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 30000);
    pending.set(requestId, controller);
    try {
      const options = { method, headers, body: body || undefined, redirect: redirect || 'follow', credentials: credentials || 'same-origin', signal: controller.signal };
      const response = redirect === 'manual'
        ? await manualFetch(parsed.href, options)
        : await session.defaultSession.fetch(parsed.href, options);
      return { status: response.status, statusText: response.statusText, headers: [...response.headers], body: Buffer.from(await response.arrayBuffer()).toString('base64') };
    } finally { clearTimeout(timer); pending.delete(requestId); }
  });
};
