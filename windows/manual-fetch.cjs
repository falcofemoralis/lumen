// Chromium's fetch rejects manual redirects and net.request hides Set-Cookie
// on redirect events. Node preserves that response for the app-managed cookie jar.
module.exports = (url, options) => fetch(url, { ...options, redirect: 'manual' });