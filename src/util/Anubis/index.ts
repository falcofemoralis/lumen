import { cookiesManager, isCookieExpired, parseCookies } from 'Util/Cookies';

import { parseChallenge, solvePow } from './challenge';

export { isAnubisChallenge } from './challenge';

const PASS_CHALLENGE_PATH = '/.within.website/x/cmd/anubis/api/pass-challenge';
// Anubis sets this cookie's value to the challenge id; pass-challenge requires it.
const VERIFICATION_COOKIE = 'techaro.lol-anubis-cookie-verification';

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function headerValue(headers: HeadersInit | undefined, name: string): string | undefined {
  if (!headers) {
    return undefined;
  }

  const lower = name.toLowerCase();

  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }

  if (Array.isArray(headers)) {
    return headers.find(([key]) => key.toLowerCase() === lower)?.[1];
  }

  const key = Object.keys(headers).find((k) => k.toLowerCase() === lower);

  return key ? (headers as Record<string, string>)[key] : undefined;
}

// RN's URL implementation doesn't reliably expose `.origin`, so derive the
// scheme+authority defensively.
function getOrigin(url: URL, rawUrl: string): string {
  if (url.protocol && url.host) {
    return `${url.protocol}//${url.host}`;
  }

  const match = rawUrl.match(/^(https?:\/\/[^/]+)/i);

  return match ? match[1] : rawUrl;
}

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
export async function solveAnubis(originalUrl: string, headers?: HeadersInit): Promise<boolean> {
  let url: URL;

  try {
    url = new URL(originalUrl);
  } catch {
    return false;
  }

  const origin = getOrigin(url, originalUrl);
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

  const attempt = doSolve(origin, hostname, headers).finally(() => inFlight.delete(hostname));

  inFlight.set(hostname, attempt);

  return attempt;
}

async function doSolve(
  origin: string,
  hostname: string,
  headers?: HeadersInit
): Promise<boolean> {
  const userAgent = headerValue(headers, 'User-Agent');
  const baseHeaders: Record<string, string> = userAgent ? { 'User-Agent': userAgent } : {};

  // Fetch a FRESH challenge here (not the one customFetch happened to receive)
  // so the challenge id lines up with the verification cookie the server just
  // issued for this exact request — immune to the concurrent burst.
  let challengeHtml: string;

  try {
    const res = await fetch(`${origin}/`, {
      method: 'GET',
      headers: baseHeaders,
      redirect: 'manual',
      keepalive: true,
    });

    challengeHtml = await res.text();
  } catch (error) {
    console.warn('[Anubis] failed to fetch challenge', error);

    return false;
  }

  const challenge = parseChallenge(challengeHtml);

  if (!challenge) {
    console.warn('[Anubis] could not parse challenge');

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
    console.warn(`[Anubis] unsupported algorithm: ${algorithm}`);

    return false;
  }

  const params: Record<string, string> = {
    id,
    redir: `${origin}/`,
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

  let setCookie = '';
  let passStatus = -1;

  try {
    // Do NOT follow the 302 — the clearance cookie is on it, and following would
    // hide the Set-Cookie header.
    const passRes = await fetch(passUrl, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'manual',
      keepalive: true,
    });

    passStatus = passRes.status;
    setCookie = passRes.headers.get('Set-Cookie') ?? '';
  } catch (error) {
    console.warn('[Anubis] pass-challenge request failed', error);

    return false;
  }

  const existing = cookiesManager.get(hostname) || {};
  const valid = Object.entries({ ...existing, ...parseCookies(setCookie) })
    .filter(([, cookie]) => !isCookieExpired(cookie))
    .reduce(
      (acc, [name, cookie]) => {
        acc[name] = cookie;

        return acc;
      },
      {} as ReturnType<typeof parseCookies>
    );

  cookiesManager.set(hostname, valid);

  const gotClearance = hasClearanceCookie(hostname);

  console.log(
    `[Anubis][diag] passStatus=${passStatus} setCookie="${setCookie}" ` +
      `jarAfter=[${Object.keys(valid).join(', ')}] gotClearance=${gotClearance}`
  );

  if (!gotClearance) {
    console.warn('[Anubis] clearance cookie not obtained after solving');

    return false;
  }

  console.log(
    `[Anubis] solved (${algorithm}, difficulty ${difficulty}, nonce ${nonce}) for ${hostname}`
  );

  return true;
}
