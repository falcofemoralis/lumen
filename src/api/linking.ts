import { parseHelpLink } from 'Api/RezkaApi/utils';
import { FILM_SCREEN } from 'Navigation/navigationRoutes';

/** Open a screen inside the app, switching to the service the link belongs to. */
export interface NavigateTarget {
  kind: 'navigate';
  screen: string;
  params: Record<string, string>;
}

/** Hand the link off to the external browser. */
export interface BrowserTarget {
  kind: 'browser';
  url: string;
}

export type DeepLinkTarget = NavigateTarget | BrowserTarget;

/**
 * Film pages look like `/<type>/<genre>/<id>-<slug>.html`, e.g.
 * `/series/drama/91597-delo-dazhe-ne-v-izmene-2026.html`. The genre segment is
 * optional so short mirror links (`/films/1-avatar-2009.html`) still resolve.
 */
const FILM_PATH_REGEXP = /^(?:\/[^/]+){1,2}\/\d+-[^/]*\.html$/;

/** Rezka wraps outgoing links as `/help/<base64 of an url encoded url>/`. */
const HELP_PATH_REGEXP = /^\/help\/[^/]+\/?$/;

/**
 * The app's own scheme, declared in app.json. Used for links the app hands to the
 * system rather than receives from the web - currently the Android TV
 * recommendations channels, whose cards are opened by the launcher.
 */
const APP_SCHEME = 'lumen://';
const APP_FILM_PREFIX = `${APP_SCHEME}film/`;

/** Opens the app without navigating anywhere, ex. a TV channel logo. */
export const APP_HOME_DEEP_LINK = `${APP_SCHEME}home`;

/**
 * Builds a link to a film page that is guaranteed to resolve to this app. Mirror
 * https links would work too, but they are only claimed by the hosts listed in
 * app.json and unverified app links can end up in a chooser (or the browser).
 */
export const buildFilmDeepLink = (link: string): string => `${APP_FILM_PREFIX}${encodeURIComponent(link)}`;

const parseAppSchemeTarget = (url: string): DeepLinkTarget | null => {
  if (!url.startsWith(APP_FILM_PREFIX)) {
    return null;
  }

  let link: string;

  try {
    link = decodeURIComponent(url.slice(APP_FILM_PREFIX.length));
  } catch {
    return null;
  }

  return FILM_PATH_REGEXP.test(link)
    ? { kind: 'navigate', screen: FILM_SCREEN, params: { link } }
    : null;
};

const parseTarget = (url: URL): DeepLinkTarget | null => {
  // Links in the wild sometimes contain duplicate slashes (e.g. `//films/x`).
  const path = url.pathname.replace(/\/{2,}/g, '/');

  if (HELP_PATH_REGEXP.test(path)) {
    const target = parseHelpLink(path);

    return target && target !== path ? { kind: 'browser', url: target } : null;
  }

  if (FILM_PATH_REGEXP.test(path)) {
    // The screen (and the api underneath it) works with host-less links — the
    // currently selected provider is prepended when the page is fetched, so a
    // link shared from one mirror opens through whichever mirror is in use.
    return {
      kind: 'navigate',
      screen: FILM_SCREEN,
      params: { link: path },
    };
  }

  return null;
};

/**
 * Parse an incoming deep link into either an in-app navigation target or a
 * browser link. Returns `null` for links we don't handle (unknown host/path).
 */
export const parseDeepLink = (url: string): DeepLinkTarget | null => {
  // React Native's `URL` only understands http(s) - for any other scheme `pathname`
  // is always `/` - so our own links have to be matched before it gets involved.
  if (url.startsWith(APP_SCHEME)) {
    return parseAppSchemeTarget(url);
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  return parseTarget(parsed);
};
