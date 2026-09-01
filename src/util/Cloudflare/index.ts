import { reactNativeWebCookies } from 'Modules/react-native-web-cookies';
import NotificationStore from 'Store/Notification.store';
import { cookiesManager } from 'Util/Cookies';
import { headerValue } from 'Util/Misc';
import { storage } from 'Util/Storage';
import { getUrlOrigin } from 'Util/Url';

import {
  CLEARANCE_COOKIE,
  isCloudflareCookie,
  parseCookieHeader,
  reconcileUserAgentVersion,
  replaceUserAgent,
} from './challenge';

export { isCloudflareChallenge } from './challenge';

/**
 * How long a check gets to pass on its own before the user is asked to help.
 *
 * A non-interactive check settles in a few seconds; the rest of this is for a slow TV
 * box, which does the same work an order of magnitude slower than a phone. Past it,
 * the challenge is almost certainly one of the kinds that wants a click, and saying so
 * beats leaving the user in front of a page that looks stuck.
 */
export const AUTO_SOLVE_TIMEOUT_MS = 20000;

/**
 * The hard cap on a solve, interaction included.
 *
 * Generous because the far end of it is a person reading a checkbox, not a machine
 * waiting on another machine -- and because giving up on someone who is halfway
 * through a captcha wastes the work they just did. Cancelling with Back is the quick
 * way out; this only catches a solve nobody is attending to.
 */
export const SOLVE_TIMEOUT_MS = 180000;

/**
 * How often the WebView's cookie store is checked for the clearance cookie.
 *
 * This is the signal that actually matters, and it lands before the page Cloudflare
 * redirects to has finished loading -- so polling for it cuts a second or two off
 * every solve compared with waiting for the load to report in.
 */
export const POLL_INTERVAL_MS = 500;

/**
 * How a solve ended. `cancelled` is kept apart from `failed` only so that backing out
 * of a check on purpose does not also raise an error about it.
 */
export type CloudflareSolveOutcome = 'passed' | 'failed' | 'cancelled';

/**
 * Works a challenge for `origin` in a real browser engine, answering how it went.
 * Registered by the solver component -- see {@link registerCloudflareSolver}.
 */
export type CloudflareSolver = (
  origin: string,
  userAgent?: string
) => Promise<CloudflareSolveOutcome>;

let solver: CloudflareSolver | null = null;

/**
 * Hands over the WebView that challenges are worked in.
 *
 * The split is what keeps this module usable from anywhere: a challenge is hit deep
 * inside `customFetch`, which has no React tree to reach, while the only thing that can
 * pass the challenge is a mounted view. The component registers itself on mount and
 * clears the registration on unmount; with nothing registered a solve fails fast rather
 * than hanging on a WebView that will never appear -- which is the right answer in a
 * headless background task, where there is no UI at all.
 */
export function registerCloudflareSolver(fn: CloudflareSolver | null): void {
  solver = fn;
}

export function isCloudflareSolverAvailable(): boolean {
  return solver !== null && reactNativeWebCookies.isSupported;
}

const CLEARANCE_USER_AGENT_KEY = 'cloudflareUserAgent';

/**
 * The user agent a host's clearance cookie was issued to.
 *
 * Cloudflare binds the cookie to the user agent that earned it, so every later request
 * carrying that cookie has to send the same string or be challenged again -- which is
 * why this is remembered per host rather than derived again at each call site.
 *
 * Null for a host that has never been challenged, and then the app's configured user
 * agent stands, as it always did.
 */
export function getClearanceUserAgent(hostname: string): string | null {
  const stored = storage.getMiscStorage().load<Record<string, string>>(CLEARANCE_USER_AGENT_KEY);

  return stored?.[hostname] ?? null;
}

function setClearanceUserAgent(hostname: string, userAgent: string): void {
  const stored = storage.getMiscStorage().load<Record<string, string>>(CLEARANCE_USER_AGENT_KEY) ?? {};

  storage.getMiscStorage().save(CLEARANCE_USER_AGENT_KEY, { ...stored, [hostname]: userAgent });
}

/**
 * The headers a request should be re-sent with once a challenge has been passed.
 *
 * A caller builds its headers before the request goes out, which is necessarily before
 * anyone knows a challenge is coming -- so the user agent in them is the configured one,
 * while the clearance that just came back was earned under the corrected one. Replaying
 * the new cookie under the old user agent is refused, and the retry is wasted: the
 * request fails, and only a second attempt -- built after the corrected user agent was
 * stored -- succeeds. Bringing the headers up to date is what makes the first one work.
 *
 * Handed straight back when the host has no clearance user agent of its own.
 */
export function withClearanceUserAgent(
  headers: HeadersInit | undefined,
  hostname: string
): HeadersInit | undefined {
  const userAgent = getClearanceUserAgent(hostname);

  return userAgent ? replaceUserAgent(headers, userAgent) : headers;
}

/** Whether the jar currently holds a clearance cookie for the host. */
export function hasClearanceCookie(hostname: string): boolean {
  const jar = cookiesManager.get(hostname) || {};

  return !!jar[CLEARANCE_COOKIE]?.value;
}

/**
 * Forgets the Cloudflare cookies held for a host, leaving the site's own (the login
 * session) alone.
 *
 * Called before a solve: reaching a solve at all means the clearance we had was
 * refused, and keeping it around would make the "did this work?" check below pass on
 * the strength of the very cookie that just failed.
 */
function dropCloudflareCookies(hostname: string): void {
  const jar = cookiesManager.get(hostname) || {};
  const remaining = Object.fromEntries(
    Object.entries(jar).filter(([name]) => !isCloudflareCookie(name))
  );

  cookiesManager.set(hostname, remaining);
}

/**
 * Copies the Cloudflare cookies the WebView has earned for `url` into the app's jar,
 * and answers whether a clearance cookie is now in there.
 *
 * Only Cloudflare's own cookies cross over: the WebView is signed out, so its copy of
 * the site's session cookies is an anonymous one that would overwrite the user's.
 *
 * The store hands back names and values with no attributes, so there is no expiry to
 * carry -- which matches how the jar already treats a seeded cookie, and is harmless
 * because a stale clearance simply draws a fresh challenge and another solve.
 *
 * Safe to call repeatedly; the solver component polls it to spot the moment the
 * challenge is passed, which can be before the page it redirects to has finished.
 */
export async function harvestClearance(url: string): Promise<boolean> {
  let hostname: string;

  try {
    ({ hostname } = new URL(url));
  } catch {
    return false;
  }

  const raw = await reactNativeWebCookies.getCookies(url);
  const webCookies = parseCookieHeader(raw);
  const jar = { ...(cookiesManager.get(hostname) || {}) };

  let changed = false;

  Object.entries(webCookies).forEach(([name, value]) => {
    if (!isCloudflareCookie(name) || !value || jar[name]?.value === value) {
      return;
    }

    jar[name] = { name, value };
    changed = true;
  });

  if (changed) {
    cookiesManager.set(hostname, jar);
    // The WebView writes its store on its own schedule; a clearance earned seconds
    // before the process is killed would otherwise have to be earned again.
    reactNativeWebCookies.flush();
  }

  return !!jar[CLEARANCE_COOKIE]?.value;
}

/**
 * One solve at a time per host, for the same reason Anubis serialises: several requests
 * fail their challenge at once (the app fans out on opening a screen), and each would
 * otherwise raise its own WebView to work the same challenge. They join the first one
 * instead and all retry on its result.
 */
const inFlight = new Map<string, Promise<boolean>>();

/**
 * Whether a challenge is being worked right now.
 *
 * For callers that put their own deadline on a request: a solve can sit for minutes
 * waiting on the user, and a timer that does not know to stand aside would abort a
 * request that is about to succeed.
 */
export function isSolvingCloudflare(): boolean {
  return inFlight.size > 0;
}

/**
 * Passes a Cloudflare bot check for the given URL's origin and stores the clearance
 * cookie, so the request that hit it can simply be made again.
 *
 * Unlike Anubis's proof-of-work, there is nothing here to compute: the check runs
 * obfuscated JS and measures the browser running it, so the only way through is to be a
 * browser. That is what the WebView is for -- it works the challenge exactly as Chrome
 * would, and the cookie it earns is lifted out of its store into the app's jar
 * (`cookiesManager`, already persisted to MMKV) so every later request replays it.
 *
 * The cookie is issued against the client's IP and user agent, so the WebView is
 * pointed at the same user agent the app sends. A cookie earned under a different one
 * is refused, and the app would challenge in a loop.
 */
export async function solveCloudflare(originalUrl: string, headers?: HeadersInit): Promise<boolean> {
  let hostname: string;

  try {
    ({ hostname } = new URL(originalUrl));
  } catch {
    return false;
  }

  const pending = inFlight.get(hostname);

  if (pending) {
    return pending;
  }

  const attempt = doSolve(originalUrl, hostname, headers).finally(() => inFlight.delete(hostname));

  inFlight.set(hostname, attempt);

  return attempt;
}

async function doSolve(
  originalUrl: string,
  hostname: string,
  headers?: HeadersInit
): Promise<boolean> {
  if (!solver) {
    NotificationStore.displayError('[Cloudflare] no solver available for the challenge');

    return false;
  }

  if (!reactNativeWebCookies.isSupported) {
    // Without the native store the WebView could pass the challenge and we would still
    // have no way to read the cookie back out of it -- it is HttpOnly.
    NotificationStore.displayError('[Cloudflare] this build cannot read the WebView cookies');

    return false;
  }

  // The site root rather than the URL that failed: clearance is issued for the whole
  // origin, and the failing URL is often an endpoint that only answers to POST.
  const origin = getUrlOrigin(originalUrl);

  dropCloudflareCookies(hostname);

  // The version the app claims is corrected to the browser that is really installed
  // before the challenge ever sees it -- see `reconcileUserAgentVersion`. Both sides
  // then agree: the WebView earns the cookie under this string, and the app sends the
  // same one afterwards, which is the only way Cloudflare honours it.
  const userAgent = reconcileUserAgentVersion(
    headerValue(headers, 'User-Agent'),
    await reactNativeWebCookies.getDefaultUserAgent()
  );

  const outcome = await solver(origin, userAgent);

  // Harvest whatever happened. A solve that gave up on the clock can still have been
  // handed a cookie on the way, and that cookie is the only thing that actually
  // decides this -- the verdict above only says what the page looked like.
  const cleared = await harvestClearance(origin);

  if (cleared && userAgent) {
    // Kept with the cookie, because the cookie is only good while it is sent back with
    // the very user agent it was issued to.
    setClearanceUserAgent(hostname, userAgent);
  }

  // Backing out on purpose is not a failure worth a toast; the user just did it.
  if (!cleared && outcome !== 'cancelled') {
    NotificationStore.displayError(
      outcome === 'passed'
        ? '[Cloudflare] challenge passed but no clearance cookie was set'
        : '[Cloudflare] could not pass the challenge'
    );
  }

  return cleared;
}

/** Drops the WebView's own store, for a sign-out. */
export function clearWebCookies(): Promise<boolean> {
  return reactNativeWebCookies.clearCookies();
}
