import ReactNativeWebCookiesModule from './ReactNativeWebCookiesModule';

/**
 * The WebView's cookie store.
 *
 * Separate from the app's own jar (`Util/Cookies`) in both directions: nothing the app
 * fetches lands here, and nothing a WebView is given is sent on the app's requests. The
 * one thing that has to cross is a bot-check clearance cookie, which only a real browser
 * engine can earn and which is `HttpOnly`, so the page cannot read it out itself.
 *
 * Android only. Everywhere else {@link isSupported} is false and every read comes back
 * empty rather than throwing.
 */
class ReactNativeWebCookies {
  /**
   * Whether this build can reach the store at all -- worth checking once rather than
   * per read, e.g. to skip a WebView solve that could never be harvested.
   */
  get isSupported(): boolean {
    return ReactNativeWebCookiesModule !== null;
  }

  /**
   * Every cookie held for `url`, `HttpOnly` ones included, as a `Cookie` header value
   * (`name=value; name=value`). Empty string when there are none, or when this build
   * has no native module to ask.
   */
  getCookies(url: string): Promise<string> {
    if (!ReactNativeWebCookiesModule) {
      return Promise.resolve('');
    }

    return ReactNativeWebCookiesModule.getCookies(url);
  }

  /** Drops every cookie the WebView holds, for a sign-out. */
  clearCookies(): Promise<boolean> {
    if (!ReactNativeWebCookiesModule) {
      return Promise.resolve(false);
    }

    return ReactNativeWebCookiesModule.clearCookies();
  }

  /**
   * The user agent this device's WebView uses when it is left alone -- carrying the
   * browser version that is really installed. Empty when there is nothing to ask.
   */
  getDefaultUserAgent(): Promise<string> {
    if (!ReactNativeWebCookiesModule) {
      return Promise.resolve('');
    }

    return ReactNativeWebCookiesModule.getDefaultUserAgent();
  }

  /** Persists the store, so a cookie just earned survives the process being killed. */
  flush(): Promise<void> {
    if (!ReactNativeWebCookiesModule) {
      return Promise.resolve();
    }

    return ReactNativeWebCookiesModule.flush();
  }
}

export const reactNativeWebCookies = new ReactNativeWebCookies();
