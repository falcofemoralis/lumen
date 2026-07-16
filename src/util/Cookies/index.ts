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

export class CookiesManager {
  private cookieMap = new Map<string, Record<string, setCookieParser.Cookie>>();

  constructor() {
    this.cookieMap = new Map();
  }

  public get(hostname: string) {
    if (!this.cookieMap.has(hostname)) {
      const dbCookies = storage.getCookiesStorage().load(hostname) || {};
      this.cookieMap.set(hostname, dbCookies);
    }

    return this.cookieMap.get(hostname);
  }

  public set(hostname: string, cookies: Record<string, setCookieParser.Cookie>) {
    this.cookieMap.set(hostname, cookies);
    storage.getCookiesStorage().save(hostname, cookies);
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
      {} as Record<string, setCookieParser.Cookie>
    );

  cookiesManager.set(hostname, validNewCookies);
};

export const buildCookies = (hostname: string) => {
  return buildCookieString(cookiesManager.get(hostname) || {});
};