import NotificationStore from 'Store/Notification.store';
import { buildCookies, cookiesManager, isCookieExpired, setCookies } from 'Util/Cookies';
import { headerValue } from 'Util/Misc';
import { getUrlOrigin } from 'Util/Url';

import { parseChallenge, solvePow } from './challenge';

export { isAnubisChallenge } from './challenge';

const PASS_CHALLENGE_PATH = '/.within.website/x/cmd/anubis/api/pass-challenge';
// Anubis sets this cookie's value to the challenge id; pass-challenge requires it.
const VERIFICATION_COOKIE = 'techaro.lol-anubis-cookie-verification';

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

// A clearance cookie is any non-empty, unexpired anubis cookie that isn't the
// verification cookie. Name-agnostic: deployments use `techaro.lol-anubis` or
// `techaro.lol-anubis-auth`.
function hasClearanceCookie(hostname: string): boolean {
  const jar = cookiesManager.get(hostname) || {};

  return Object.values(jar).some(
    (cookie) =>
      cookie.name.includes('anubis') &&
      !cookie.name.includes('verification') &&
      !!cookie.value &&
      !isCookieExpired(cookie)
  );
}

// One solve at a time per host. Anubis binds each challenge to the request
// session via the verification cookie, and RN's always-on native cookie jar is
// shared across all in-flight requests — so overlapping solves let one
// challenge's cookies clobber another's (mismatch → HTTP 500). Serializing
// keeps the jar consistent with the single challenge being solved.
const inFlight = new Map<string, Promise<boolean>>();

/**
 * Solve an Anubis proof-of-work challenge for the given URL's origin and store
 * the resulting clearance cookie so subsequent requests are let through.
 *
 * The clearance cookie is written into the app's per-hostname jar
 * (`cookiesManager`), which already persists to MMKV, so it is replayed with no
 * extra persistence code.
 */
export async function solveAnubis(originalUrl: string, bodyText: string, headers?: HeadersInit): Promise<boolean> {
  let url: URL;

  try {
    url = new URL(originalUrl);
  } catch {
    return false;
  }

  const origin = getUrlOrigin(originalUrl);
  const { hostname } = url;

  // Another request may already have solved it.
  if (hasClearanceCookie(hostname)) {
    return true;
  }

  // Coalesce concurrent solves for the same host onto one in-flight attempt.
  const pending = inFlight.get(hostname);

  if (pending) {
    return pending;
  }

  const attempt = doSolve(origin, hostname, bodyText, originalUrl, headers).finally(() => inFlight.delete(hostname));

  inFlight.set(hostname, attempt);

  return attempt;
}

async function doSolve(
  origin: string,
  hostname: string,
  bodyText: string,
  originalUrl: string,
  headers?: HeadersInit
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
  // Anubis sets the verification cookie's value to the challenge id and requires
  // it echoed here. Send exactly that — no other cookies.
  const requestHeaders: Record<string, string> = {
    ...baseHeaders,
    Cookie: `${VERIFICATION_COOKIE}=${id}`,
  };

  try {
    // Do NOT follow the 302 — the clearance cookie is on it, and following would
    // hide the Set-Cookie header.
    const passRes = await fetch(passUrl, {
      method: 'GET',
      headers: {
        ...requestHeaders,
        Cookie: buildCookies(hostname),
      },
      credentials: 'omit',
      redirect: 'manual',
      keepalive: true,
    });

    setCookies(hostname, passRes);
  } catch (error) {
    NotificationStore.displayError(`[Anubis] pass-challenge request failed${ error}`);

    return false;
  }

  if (!hasClearanceCookie(hostname)) {
    NotificationStore.displayError('[Anubis] clearance cookie not obtained after solving');

    return false;
  }

  return true;
}
