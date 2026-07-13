import setCookieParser from 'set-cookie-parser';
import { isAnubisChallenge, solveAnubis } from 'Util/Anubis';
import {
  buildCookieString,
  cookiesManager,
  isCookieExpired,
  parseCookies,
} from 'Util/Cookies';

import { wrapFetchWithReactotron } from '../../devtools/FetchInterceptor';

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
async function _customFetch(
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
      Cookie: buildCookieString(cookiesManager.get(hostname) || {}),
    },
    credentials: 'omit', // Omit cookies and handle ourselves
    keepalive: true,
  });

  const existingCookies = cookiesManager.get(hostname) || {};

  const newCookies = parseCookies(res.headers.get('Set-Cookie') || '');

  // Update the existing cookies with new ones
  const combinedCookies = { ...existingCookies, ...newCookies };

  // Filter out expired cookies
  const validNewCookies = Object.entries(combinedCookies)
    .filter(([, cookie]) => !isCookieExpired(cookie))
    .reduce(
      (acc, [name, cookie]) => {
        acc[name] = cookie;

        return acc;
      },
      {} as Record<string, setCookieParser.Cookie>
    );

  cookiesManager.set(hostname, validNewCookies);

  const bodyText = await res.text();

  // Anubis serves its proof-of-work interstitial (HTTP 200) in place of the
  // requested content. Solve it once, then transparently re-drive the request.
  if (!retried && isAnubisChallenge(bodyText)) {
    const solved = await solveAnubis(url, init?.headers);

    if (solved) {
      return _customFetch(input, init, true);
    }
  }

  return rebuildResponse(res, bodyText);
}

export const customFetch = __DEV__
  ? wrapFetchWithReactotron(_customFetch)
  : _customFetch;
