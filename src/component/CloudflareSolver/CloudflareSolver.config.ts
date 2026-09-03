/**
 * Reports whether the page on screen is still a bot check.
 *
 * Runs in the page's own world after each load, so it can see `_cf_chl_opt` -- the
 * challenge platform's global -- alongside the markup. Kept to id and attribute
 * lookups rather than a scan of the document: it repeats on a timer, and the page it
 * ends up on is a full film listing.
 *
 * Deliberately the same markers `Util/Cloudflare/challenge` matches a response body
 * on, read from the live DOM instead of from HTML text.
 *
 * The interval is parked on a `window` flag so that navigating (which is how a passed
 * challenge announces itself) starts exactly one probe for the new document rather
 * than stacking another on top of the old one.
 */
export const CHALLENGE_PROBE_SCRIPT = `
(function () {
  var report = function () {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        challenge: !!(
          window._cf_chl_opt ||
          document.getElementById('challenge-form') ||
          document.getElementById('challenge-running') ||
          document.getElementById('challenge-error-title') ||
          document.querySelector('script[src*="/cdn-cgi/challenge-platform/"]')
        ),
      }));
    } catch (e) {}
  };

  report();

  if (!window.__lumenCfProbe) {
    window.__lumenCfProbe = setInterval(report, 1000);
  }
})();
true;
`;
