import setCookieParser from 'set-cookie-parser';
import StorageStore from 'Store/Storage.store';

export function parseCookies(cookieString: string) {
  const cookies: { [key: string]: any } = {};
  const cookieArray = cookieString.split(/,(?=\s*\w+=)/);

  cookieArray.forEach((cookie) => {
    const parts = cookie.split(';').map((part) => part.trim());
    const [name, value] = parts[0].split('=');
    const cookieObj: { [key: string]: any } = { value };

    parts.slice(1).forEach((part) => {
      const [key, val] = part.split('=');
      cookieObj[key.trim()] = val ? val.trim() : true;
    });

    cookies[name] = cookieObj;
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
      const dbCookies = StorageStore.getCookiesStorage().getString(hostname);
      this.cookieMap.set(hostname, dbCookies ? JSON.parse(dbCookies) : {});
    }

    return this.cookieMap.get(hostname);
  }

  public set(hostname: string, cookies: Record<string, setCookieParser.Cookie>) {
    this.cookieMap.set(hostname, cookies);
    StorageStore.getCookiesStorage().set(hostname, JSON.stringify(cookies));
  }

  public reset() {
    StorageStore.getCookiesStorage().clearAll();
  }
}

export const cookiesManager = new CookiesManager();
