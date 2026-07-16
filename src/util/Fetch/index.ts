import { isAnubisChallenge, solveAnubis } from 'Util/Anubis';
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

  // Anubis serves its proof-of-work interstitial (HTTP 200) in place of the
  // requested content. Solve it once, then transparently re-drive the request.
  if (!retried && isAnubisChallenge(bodyText)) {
    const solved = await solveAnubis(url, bodyText, init?.headers);

    if (solved) {
      return customFetch(input, init, true);
    }
  }

  return rebuildResponse(res, bodyText);
}
