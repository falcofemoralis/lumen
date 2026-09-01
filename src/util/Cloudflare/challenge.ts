/** The cookie a passed challenge is worth -- Cloudflare lets a request through on it. */
export const CLEARANCE_COOKIE = 'cf_clearance';

/**
 * Cookies that belong to Cloudflare rather than to the site behind it.
 *
 * Only these are carried over from a WebView solve into the app's jar. The WebView is
 * signed out -- it never had the user's session -- so copying its jar wholesale would
 * overwrite the login cookies with an anonymous set.
 */
const CLOUDFLARE_COOKIE_PREFIXES = [
  CLEARANCE_COOKIE,
  '__cf_bm', // bot management, rotates every 30 min
  '__cflb', // load balancer affinity
  '__cfwaitingroom',
  'cf_chl_', // per-challenge state
];

export function isCloudflareCookie(name: string): boolean {
  return CLOUDFLARE_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix));
}

/**
 * Markers only an interstitial carries.
 *
 * Deliberately narrow. Every page of a site behind Cloudflare is free to mention
 * `/cdn-cgi/` (email obfuscation, Rocket Loader), and a *block* page -- error 1020, a
 * WAF rule, a country ban -- is served from the same infrastructure but cannot be
 * solved by anyone. Matching those would spend 30s in a WebView per request for
 * nothing, so the markers here are the ones the challenge platform itself writes.
 */
const CHALLENGE_MARKERS = [
  '/cdn-cgi/challenge-platform/',
  '_cf_chl_opt',
  'cf-browser-verification', // pre-2022 "checking your browser"
  'id="challenge-form"',
  'id="challenge-running"',
  'id="challenge-error-title"',
];

/**
 * Statuses a challenge is served with. A challenge can also come back as 200 (the
 * legacy JS challenge did), which is why the body markers stand on their own and this
 * is only consulted for the header-only case below.
 */
const CHALLENGE_STATUSES = [403, 429, 503];

function headerValue(headers: Headers | undefined, name: string): string {
  return headers?.get(name)?.toLowerCase() ?? '';
}

/**
 * Whether this response is a Cloudflare bot check standing in for the page that was
 * asked for -- i.e. something a browser could work through, as opposed to a block.
 *
 * Two ways in, because Cloudflare has two generations in the field:
 *  - the interstitial HTML, which names the challenge platform outright;
 *  - `cf-mitigated: challenge`, which the managed challenge sets on its 403 and which
 *    is the only tell when the body is a bare loader.
 */
export function isCloudflareChallenge(body: string, status: number, headers?: Headers): boolean {
  if (CHALLENGE_MARKERS.some((marker) => body.includes(marker))) {
    return true;
  }

  return (
    CHALLENGE_STATUSES.includes(status) && headerValue(headers, 'cf-mitigated') === 'challenge'
  );
}

/**
 * The app's user agent with its browser version corrected to the one really installed.
 *
 * The app announces a Chrome version it picked at build time. A bot check does not take
 * that on trust -- it measures what the engine can actually do and compares. Claiming a
 * version the WebView running the challenge is not is exactly the inconsistency it
 * grades on, and it fails the check no matter how well the rest of the request behaves.
 *
 * Only the version is taken from the device. The rest of the app's string is kept as it
 * is, deliberately: a WebView's own user agent carries `wv`, and on a phone `Mobile`
 * too, either of which would have the site answer with a different layout than the one
 * the app knows how to read.
 *
 * Falls back to the app's own string whenever there is nothing better to say -- no
 * WebView to ask, or a version in a shape this does not recognise.
 */
export function reconcileUserAgentVersion(
  appUserAgent: string | undefined,
  webViewUserAgent: string
): string | undefined {
  if (!appUserAgent) {
    return appUserAgent;
  }

  const installed = webViewUserAgent.match(/Chrome\/([\d.]+)/i);

  if (!installed || !/Chrome\/[\d.]+/i.test(appUserAgent)) {
    return appUserAgent;
  }

  return appUserAgent.replace(/Chrome\/[\d.]+/i, `Chrome/${installed[1]}`);
}

/**
 * The same headers with their `User-Agent` replaced, whatever shape they came in.
 *
 * Replaced rather than added: HTTP header names are case-insensitive, so appending a
 * second `User-Agent` next to an existing `user-agent` would leave which one is sent up
 * to the client, and the wrong one costs the clearance.
 *
 * The shape is preserved on the way out, because the caller's own header handling is
 * built around the one it passed in.
 */
export function replaceUserAgent(
  headers: HeadersInit | undefined,
  userAgent: string
): HeadersInit {
  if (headers instanceof Headers) {
    const next = new Headers(headers);

    next.set('User-Agent', userAgent);

    return next;
  }

  const isUserAgent = (key: string): boolean => key.toLowerCase() === 'user-agent';

  if (Array.isArray(headers)) {
    return [...headers.filter(([key]) => !isUserAgent(key)), ['User-Agent', userAgent]];
  }

  const rest = Object.entries(headers ?? {}).filter(([key]) => !isUserAgent(key));

  return { ...Object.fromEntries(rest), 'User-Agent': userAgent };
}

/**
 * Splits a `Cookie` header value (`name=value; name=value`) into a name/value map.
 *
 * This is the request-header form the WebView store hands back, not `Set-Cookie`: there
 * are no attributes to parse, and a value is free to contain `=` (Cloudflare's
 * clearance cookie is base64-ish and often does), so only the first one separates.
 */
export function parseCookieHeader(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!header) {
    return cookies;
  }

  header.split(';').forEach((part) => {
    const separator = part.indexOf('=');

    if (separator <= 0) {
      return;
    }

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();

    if (name) {
      cookies[name] = value;
    }
  });

  return cookies;
}
