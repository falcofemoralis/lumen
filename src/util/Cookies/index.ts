import setCookieParser, { parse, splitCookiesString } from 'set-cookie-parser';
import { storage } from 'Util/Storage';

export function parseCookies(cookieString: string): Record<string, setCookieParser.Cookie> {
  const cookies: Record<string, setCookieParser.Cookie> = {};

  if (!cookieString) {
    return cookies;
  }

  // RN merges multiple Set-Cookie headers into one comma-joined string.
  // set-cookie-parser splits it correctly even when cookie names contain
  // '.' or '-' (e.g. techaro.lol-anubis-auth), which a plain regex cannot.
  parse(splitCookiesString(cookieString), { decodeValues: false }).forEach((cookie) => {
    cookies[cookie.name] = cookie;
  });

  return cookies;
}

export function buildCookieString(cookies: Record<string, setCookieParser.Cookie>): string {
  return Object.entries(cookies)
    .map(([name, cookie]) => `${name}=${cookie.value}`)
    .join('; ');
}

export function isCookieExpired(cookie: setCookieParser.Cookie): boolean {
  if (cookie.expires) {
    return new Date(cookie.expires) <= new Date();
  }

  return false;
}

type CookiesStorage = ReturnType<typeof storage.getCookiesStorage>;

export class CookiesManager {
  private cookieMap = new Map<string, Record<string, setCookieParser.Cookie>>();

  private getStorage: () => CookiesStorage;

  constructor(getStorage: () => CookiesStorage = () => storage.getCookiesStorage()) {
    this.cookieMap = new Map();
    this.getStorage = getStorage;
  }

  public get(hostname: string) {
    if (!this.cookieMap.has(hostname)) {
      const dbCookies = this.getStorage().load<Record<string, setCookieParser.Cookie>>(hostname) || {};
      this.cookieMap.set(hostname, dbCookies);
    }

    return this.cookieMap.get(hostname);
  }

  public set(hostname: string, cookies: Record<string, setCookieParser.Cookie>) {
    this.cookieMap.set(hostname, cookies);
    this.getStorage().save(hostname, cookies);
  }

  public reset() {
    this.getStorage().clear();
    this.cookieMap.clear();
  }
}

export const cookiesManager = new CookiesManager();

/**
 * The session of the second account -- the one only some requests are made as (see
 * `RezkaApi.getSecondaryCookieJar`). Kept in a storage of its own, so signing either
 * account in or out never touches the other one's cookies.
 */
export const secondaryCookiesManager = new CookiesManager(() => storage.getSecondaryCookiesStorage());

export const setCookies = (hostname: string, res: Response, jar: CookiesManager = cookiesManager) => {
  const existingCookies = jar.get(hostname) || {};

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

  jar.set(hostname, validNewCookies);
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