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
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  return parseTarget(parsed);
};
