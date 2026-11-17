import type { Cookie } from 'set-cookie-parser';

export function isCookieExpired(cookie: Cookie, now = Date.now()): boolean {
  return !!cookie.expires && new Date(cookie.expires).getTime() <= now;
}

export function hasFreshAnubisClearance(jar: Record<string, Cookie>, rejectedCookies: string): boolean {
  return Object.values(jar).some((cookie) =>
    cookie.name.includes('anubis') && !cookie.name.includes('verification') &&
    !!cookie.value && !isCookieExpired(cookie) && !rejectedCookies.split(';').some((part) =>
      part.trim() === cookie.name + '=' + cookie.value));
}