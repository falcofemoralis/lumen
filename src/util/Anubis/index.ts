import NotificationStore from 'Store/Notification.store';
import { reactNativeWebCookies } from 'Modules/react-native-web-cookies';
import { buildCookies, cookiesManager, setCookies } from 'Util/Cookies';
import { headerValue } from 'Util/Misc';
import { getUrlOrigin } from 'Util/Url';
import { hasFreshAnubisClearance } from 'Util/Cookies/lifecycle';
import { runBoundedChallenge } from 'Util/Request/boundedChallenge';

import { anubisPassCookies, freshAnubisAuthCookies, parseChallenge, solvePow } from './challenge';

export { isAnubisChallenge } from './challenge';

const PASS_CHALLENGE_PATH = '/.within.website/x/cmd/anubis/api/pass-challenge';

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function buildPassChallengeUrl(
  origin: string,
  basePrefix: string,
  params: Record<string, string>
): string {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${origin}${basePrefix}${PASS_CHALLENGE_PATH}?${query}`;
}

// One solve at a time per host. Anubis binds each challenge to the request
// session via the verification cookie, and RN's always-on native cookie jar is
// shared across all in-flight requests — so overlapping solves let one
// challenge's cookies clobber another's (mismatch → HTTP 500). Serializing
// keeps the jar consistent with the single challenge being solved.
const inFlight = new Map<string, Promise<boolean>>();
export const isSolvingAnubis = () => inFlight.size > 0;

/**
 * Solve an Anubis proof-of-work challenge for the given URL's origin and store
 * the resulting clearance cookie so subsequent requests are let through.
 *
 * The clearance cookie is written into the app's per-hostname jar
 * (`cookiesManager`), which already persists to MMKV, so it is replayed with no
 * extra persistence code.
 */
export async function solveAnubis(originalUrl: string, bodyText: string, headers?: HeadersInit, rejectedCookies = ''): Promise<boolean> {
  let url: URL;

  try {
    url = new URL(originalUrl);
  } catch {
    return false;
  }

  const origin = getUrlOrigin(originalUrl);
  const { hostname } = url;

  // Coalesce concurrent solves for the same host onto one in-flight attempt.
  const pending = inFlight.get(hostname);

  if (pending) {
    return pending;
  }

  const jar = cookiesManager.get(hostname) || {};
  if (hasFreshAnubisClearance(jar, rejectedCookies)) {
    return true;
  }
  cookiesManager.set(hostname, Object.fromEntries(Object.entries(jar).filter(([name]) =>
    !name.includes('anubis') || name.includes('verification'))));
  const controller = new AbortController();
  return runBoundedChallenge(inFlight, hostname,
    () => doSolve(origin, hostname, bodyText, originalUrl, headers, rejectedCookies, controller.signal),
    35_000, () => controller.abort());
}

async function doSolve(
  origin: string,
  hostname: string,
  bodyText: string,
  originalUrl: string,
  headers?: HeadersInit,
  rejectedCookies = '',
  signal?: AbortSignal
): Promise<boolean> {
  const userAgent = headerValue(headers, 'User-Agent');
  const baseHeaders: Record<string, string> = userAgent ? { 'User-Agent': userAgent } : {};

  const challenge = parseChallenge(bodyText);

  if (!challenge) {
    NotificationStore.displayError('[Anubis] could not parse challenge');

    return false;
  }

  const { id, randomData, algorithm, difficulty, basePrefix } = challenge;

  const start = Date.now();
  let nonce = 0;
  let response = '';

  if (algorithm === 'fast' || algorithm === 'slow') {
    const solution = solvePow(randomData, difficulty);

    nonce = solution.nonce;
    response = solution.hash;
  } else if (algorithm === 'metarefresh') {
    // No proof-of-work: Anubis only requires waiting out a short delay.
    await delay((difficulty + 1) * 1000);
  } else {
    NotificationStore.displayError(`[Anubis] unsupported algorithm: ${algorithm}`);

    return false;
  }

  const params: Record<string, string> = {
    id,
    redir: originalUrl,
    elapsedTime: String(Date.now() - start),
  };

  if (response) {
    params.response = response;
    params.nonce = String(nonce);
  }

  const passUrl = buildPassChallengeUrl(origin, basePrefix, params);
  // Keep account cookies, but pin verification to the challenge being solved.

  try {
    // Do NOT follow the 302 — the clearance cookie is on it, and following would
    // hide the Set-Cookie header.
    const passRes = await fetch(passUrl, {
      method: 'GET',
      headers: {
        ...baseHeaders,
        Cookie: anubisPassCookies(buildCookies(hostname), id),
      },
      credentials: 'omit',
      redirect: 'manual',
      signal,
      keepalive: true,
    });

    if (signal?.aborted) return false;
    setCookies(hostname, passRes);
    if (!hasFreshAnubisClearance(cookiesManager.get(hostname) || {}, rejectedCookies)) {
      // Android/WSA may follow the redirect natively before exposing its headers.
      const nativeCookies = await reactNativeWebCookies.getCookies(originalUrl).catch(() => '');
      if (signal?.aborted) return false;
      const recovered = freshAnubisAuthCookies(nativeCookies, rejectedCookies);
      if (Object.keys(recovered).length) cookiesManager.set(hostname, {
        ...cookiesManager.get(hostname),
        ...Object.fromEntries(Object.entries(recovered).map(([name, value]) =>
          [name, { name, value, expires: new Date(Date.now() + 60 * 60_000) }])),
      });
    }
  } catch (error) {
    NotificationStore.displayError(`[Anubis] pass-challenge request failed${ error}`);

    return false;
  }

  if (!hasFreshAnubisClearance(cookiesManager.get(hostname) || {}, '')) {
    NotificationStore.displayError('[Anubis] clearance cookie not obtained after solving');

    return false;
  }

  return true;
}
