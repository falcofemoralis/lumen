import setCookieParser from 'set-cookie-parser';
import {
  buildCookieString,
  cookiesManager,
  isCookieExpired,
  parseCookies,
} from 'Util/Cookies';

// A wrapper around fetch since RN messes up handling of cookies
export function customFetch(input: RequestInfo | URL, init?: RequestInit | undefined) {
  const { hostname } = new URL(input instanceof Request ? input.url : input);

  return fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Cookie: buildCookieString(cookiesManager.get(hostname) || {}),
    },
    credentials: 'omit', // Omit cookies and handle ourselves
  }).then((res) => {
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
        {} as Record<string, setCookieParser.Cookie>,
      );

    cookiesManager.set(hostname, validNewCookies);

    return res;
  });
}
