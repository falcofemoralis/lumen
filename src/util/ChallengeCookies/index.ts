import { reactNativeWebCookies } from 'Modules/react-native-web-cookies';
import { isSolvingAnubis } from 'Util/Anubis';
import { isSolvingCloudflare } from 'Util/Cloudflare';
import { parseCookieHeader } from 'Util/Cloudflare/challenge';
import { cookiesManager } from 'Util/Cookies';
import { isChallengeCookie } from 'Util/NetworkRecovery';
import { storage } from 'Util/Storage';

let resetting: Promise<boolean> | null = null;

export function resetChallengeCookies(): Promise<boolean> {
  if (resetting) return resetting;
  if (isSolvingAnubis() || isSolvingCloudflare()) return Promise.resolve(false);
  resetting = (async () => {
    const userAgents = storage.getMiscStorage().load<Record<string, string>>('cloudflareUserAgent') ?? {};
    const hosts = new Set([...cookiesManager.getHosts(), ...Object.keys(userAgents)]);
    for (const host of hosts) {
      const jar = cookiesManager.get(host) || {};
      const origin = 'https://' + host;
      const native = parseCookieHeader(await reactNativeWebCookies.getCookies(origin));
      const names = Array.from(new Set([...Object.keys(jar), ...Object.keys(native)])).filter(isChallengeCookie);
      await reactNativeWebCookies.removeCookies(origin, names);
      cookiesManager.set(host, Object.fromEntries(Object.entries(jar).filter(([name]) => !isChallengeCookie(name))));
    }
    storage.getMiscStorage().save('cloudflareUserAgent', {});
    return true;
  })().finally(() => { resetting = null; });
  return resetting;
}