// Chromium rejects some CDN requests with an explicit cross-site Origin/Referer.
// These streams already carry their source-provided headers and need no browser
// challenge session; Node's HTTP transport preserves those headers as supplied.
module.exports = async (session, url, options = {}) => {
  const headers = options.headers || {}, controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  const signal = options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal;
  try {
    return await (Object.keys(headers).some(name => /^(origin|referer)$/i.test(name))
      ? fetch(url, { ...options, signal })
      : session.defaultSession.fetch(url, { ...options, signal }));
  } finally { clearTimeout(timer); }
};
