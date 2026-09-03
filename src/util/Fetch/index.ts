import { isAnubisChallenge, solveAnubis } from 'Util/Anubis';
import { isCloudflareChallenge, solveCloudflare, withClearanceUserAgent } from 'Util/Cloudflare';
import { buildCookies, setCookies } from 'Util/Cookies';

// Rebuild a Response from an already-read body so callers can still read it.
function rebuildResponse(res: Response, bodyText: string): Response {
  const nullBody =
    res.status === 204 || res.status === 304 || (res.status >= 100 && res.status < 200);

  return new Response(nullBody ? null : bodyText, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
}

// A wrapper around fetch since RN messes up handling of cookies
export async function customFetch(
  input: RequestInfo | URL,
  init?: RequestInit | undefined,
  retried = false
): Promise<Response> {
  const url = input instanceof Request ? input.url : input.toString();
  const { hostname } = new URL(url);

  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Cookie: buildCookies(hostname),
    },
    credentials: 'omit', // Omit cookies and handle ourselves
    keepalive: true,
  });

  setCookies(hostname, res);

  const bodyText = await res.text();

  // A bot check stands in for the content that was asked for -- Anubis serves its
  // proof-of-work interstitial as an HTTP 200, Cloudflare mostly a 403. Either way the
  // fix is the same: pass it once, which leaves a cookie in the jar, then transparently
  // re-drive the request. `retried` bounds it to a single attempt, so a clearance that
  // is refused fails the request instead of looping.
  if (!retried) {
    if (isAnubisChallenge(bodyText)) {
      const solved = await solveAnubis(url, bodyText, init?.headers);

      if (solved) {
        return customFetch(input, init, true);
      }
    }

    if (isCloudflareChallenge(bodyText, res.status, res.headers)) {
      const solved = await solveCloudflare(url, init?.headers);

      if (solved) {
        // Not the headers we came in with: Cloudflare pins the clearance to the user
        // agent that earned it, and these were built before there was a challenge to
        // earn one for. Sending the stale one back with the new cookie is refused, and
        // the one retry there is would be spent on it.
        return customFetch(
          input,
          { ...init, headers: withClearanceUserAgent(init?.headers, hostname) },
          true
        );
      }
    }
  }

  return rebuildResponse(res, bodyText);
}
