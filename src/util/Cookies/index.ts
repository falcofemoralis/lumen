import { parse, splitCookiesString, type Cookie } from 'set-cookie-parser';
import { storage } from 'Util/Storage';
import { isCookieExpired } from './lifecycle';
export { isCookieExpired } from './lifecycle';

export function parseCookies(cookieString: string): Record<string, Cookie> {
  const cookies: Record<string, Cookie> = {};

  if (!cookieString) {
    return cookies;
  }

  // RN merges multiple Set-Cookie headers into one comma-joined string.
  // set-cookie-parser splits it correctly even when cookie names contain
  // '.' or '-' (e.g. techaro.lol-anubis-auth), which a plain regex cannot.
  parse(splitCookiesString(cookieString), { decodeValues: false }).forEach((cookie) => {
    if (cookie.maxAge !== undefined) cookie.expires = new Date(Date.now() + Number(cookie.maxAge) * 1000);
    cookies[cookie.name] = cookie;
  });

  return cookies;
}

export function buildCookieString(cookies: Record<string, Cookie>): string {
  return Object.entries(cookies)
    .map(([name, cookie]) => `${name}=${cookie.value}`)
    .join('; ');
}



export class CookiesManager {
  private cookieMap = new Map<string, Record<string, Cookie>>();

  constructor() {
    this.cookieMap = new Map();
  }

  public get(hostname: string) {
    if (!this.cookieMap.has(hostname)) {
      const dbCookies = (storage.getCookiesStorage().load(hostname) || {}) as Record<string, Cookie>;
      this.cookieMap.set(hostname, dbCookies);
    }

    const cookies = this.cookieMap.get(hostname) || {};
    const valid = Object.fromEntries(Object.entries(cookies).filter(([, cookie]) => !isCookieExpired(cookie)));
    if (Object.keys(valid).length !== Object.keys(cookies).length) this.set(hostname, valid);
    return valid;
  }

  public set(hostname: string, cookies: Record<string, Cookie>) {
    this.cookieMap.set(hostname, cookies);
    storage.getCookiesStorage().save(hostname, cookies);
  }

  public getHosts(): string[] {
    return Array.from(new Set([...storage.getCookiesStorage().getKeys(), ...this.cookieMap.keys()]));
  }

  public reset() {
    storage.getCookiesStorage().clear();
    this.cookieMap.clear();
  }
}

export const cookiesManager = new CookiesManager();

export const setCookies = (hostname: string, res: Response) => {
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
      {} as Record<string, Cookie>
    );

  cookiesManager.set(hostname, validNewCookies);
};

/**
 * Seeds a cookie the server never sent us. `customFetch` builds the `Cookie`
 * header from the jar and overwrites whatever a caller passed in its headers,
 * so this is the only way to add one for an endpoint that gates on it.
 */
export const setCookie = (hostname: string, name: string, value: string) => {
  const cookies = cookiesManager.get(hostname) || {};

  if (cookies[name]?.value === value) {
    return;
  }

  cookiesManager.set(hostname, {
    ...cookies,
    [name]: { name, value },
  });
};

export const buildCookies = (hostname: string) => {
  return buildCookieString(cookiesManager.get(hostname) || {});
};