import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CLEARANCE_COOKIE,
  isCloudflareChallenge,
  isCloudflareCookie,
  parseCookieHeader,
  reconcileUserAgentVersion,
  replaceUserAgent,
} from 'Util/Cloudflare/challenge';

const appUserAgent =
  'Mozilla/5.0 (Linux; Android 14; Google Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';

// What an Android WebView says about itself: the real version, plus the `wv` token and
// (on a phone) `Mobile` -- neither of which the app wants to inherit.
const webViewUserAgent =
  'Mozilla/5.0 (Linux; Android 14; Google Pixel 7 Build/UP1A) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36';

const interstitialBody = `<!DOCTYPE html><html><head><title>Just a moment...</title></head>
<body class="no-js">
<div class="main-wrapper"><div id="challenge-running">Verifying you are human.</div></div>
<script>window._cf_chl_opt={cvId:'3',cType:'managed',cRay:'8f2c'};</script>
<script src="/cdn-cgi/challenge-platform/h/g/orchestrate/chl_page/v1?ray=8f2c"></script>
</body></html>`;

// Served from the same infrastructure, but nothing a browser can work through -- a
// solve attempt would burn the whole timeout for nothing.
const blockBody = `<!DOCTYPE html><html><head><title>Attention Required! | Cloudflare</title></head>
<body><div class="cf-error-details"><h1>Sorry, you have been blocked</h1>
<p>Cloudflare Ray ID: 8f2c &bull; Error 1020</p></div>
<script src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/rocket-loader.min.js"></script>
</body></html>`;

// A real page from a site behind Cloudflare: it references /cdn-cgi/ of its own accord.
const normalBody = `<!DOCTYPE html><html><body>
<div class="b-content__inline_item">film</div>
<a href="/cdn-cgi/l/email-protection#abc">contact</a>
</body></html>`;

test('isCloudflareChallenge detects the interstitial', () => {
  assert.equal(isCloudflareChallenge(interstitialBody, 403), true);
});

test('isCloudflareChallenge detects a managed challenge from its header alone', () => {
  const headers = new Headers({ 'cf-mitigated': 'challenge', server: 'cloudflare' });

  assert.equal(isCloudflareChallenge('<html><body></body></html>', 403, headers), true);
});

test('isCloudflareChallenge ignores a block page and a normal page', () => {
  assert.equal(isCloudflareChallenge(blockBody, 403), false);
  assert.equal(isCloudflareChallenge(normalBody, 200), false);
});

test('isCloudflareChallenge ignores the mitigated header on a successful response', () => {
  const headers = new Headers({ 'cf-mitigated': 'challenge' });

  assert.equal(isCloudflareChallenge(normalBody, 200, headers), false);
});

test('isCloudflareCookie keeps Cloudflare cookies apart from the site session', () => {
  assert.equal(isCloudflareCookie(CLEARANCE_COOKIE), true);
  assert.equal(isCloudflareCookie('__cf_bm'), true);
  assert.equal(isCloudflareCookie('cf_chl_2'), true);
  assert.equal(isCloudflareCookie('dle_password'), false);
  assert.equal(isCloudflareCookie('dle_user_id'), false);
});

test('parseCookieHeader splits a Cookie header and keeps "=" inside values', () => {
  const cookies = parseCookieHeader(
    'cf_clearance=Xy9.aB_c-d0e1f2g3h4i5j6k7l8m9n0=; __cf_bm=abc123; dle_user_id=42'
  );

  assert.deepEqual(cookies, {
    cf_clearance: 'Xy9.aB_c-d0e1f2g3h4i5j6k7l8m9n0=',
    __cf_bm: 'abc123',
    dle_user_id: '42',
  });
});

test('reconcileUserAgentVersion takes only the version from the WebView', () => {
  const reconciled = reconcileUserAgentVersion(appUserAgent, webViewUserAgent);

  assert.equal(
    reconciled,
    'Mozilla/5.0 (Linux; Android 14; Google Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Safari/537.36'
  );
  // The tokens that would change the layout the site serves must not come across.
  assert.ok(!reconciled?.includes('wv'));
  assert.ok(!reconciled?.includes('Mobile'));
  assert.ok(!reconciled?.includes('Version/4.0'));
});

test('reconcileUserAgentVersion falls back when there is nothing better to say', () => {
  // No WebView to ask.
  assert.equal(reconcileUserAgentVersion(appUserAgent, ''), appUserAgent);
  // A user agent with no Chrome version to correct is left exactly as configured.
  assert.equal(reconcileUserAgentVersion('CustomAgent/1.0', webViewUserAgent), 'CustomAgent/1.0');
  assert.equal(reconcileUserAgentVersion(undefined, webViewUserAgent), undefined);
});

test('replaceUserAgent overwrites the header the request was built with', () => {
  const headers = replaceUserAgent(
    { 'Content-Type': 'application/json', 'User-Agent': appUserAgent },
    'Corrected/1.0'
  );

  assert.deepEqual(headers, {
    'Content-Type': 'application/json',
    'User-Agent': 'Corrected/1.0',
  });
});

// Two User-Agent headers would leave which one is sent up to the client, and the wrong
// one costs the clearance the retry is carrying.
test('replaceUserAgent replaces a differently cased header rather than adding a second', () => {
  const headers = replaceUserAgent({ 'user-agent': appUserAgent, Accept: '*/*' }, 'Corrected/1.0');

  assert.deepEqual(headers, { Accept: '*/*', 'User-Agent': 'Corrected/1.0' });
});

test('replaceUserAgent keeps the shape it was given', () => {
  const fromHeaders = replaceUserAgent(new Headers({ 'user-agent': appUserAgent }), 'Corrected/1.0');

  assert.ok(fromHeaders instanceof Headers);
  assert.equal(fromHeaders.get('user-agent'), 'Corrected/1.0');

  assert.deepEqual(
    replaceUserAgent([['User-Agent', appUserAgent], ['Accept', '*/*']], 'Corrected/1.0'),
    [['Accept', '*/*'], ['User-Agent', 'Corrected/1.0']]
  );

  assert.deepEqual(replaceUserAgent(undefined, 'Corrected/1.0'), { 'User-Agent': 'Corrected/1.0' });
});

test('parseCookieHeader tolerates an empty store and malformed parts', () => {
  assert.deepEqual(parseCookieHeader(''), {});
  assert.deepEqual(parseCookieHeader('  '), {});
  assert.deepEqual(parseCookieHeader('=orphan; cf_clearance=ok; ;'), { cf_clearance: 'ok' });
});
