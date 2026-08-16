import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildFilmDeepLink, parseDeepLink } from 'Api/linking';
import { FILM_SCREEN } from 'Navigation/navigationRoutes';

const FILM_LINK = '/series/drama/91597-delo-dazhe-ne-v-izmene-2026.html';

test('app scheme film links round-trip', () => {
  const target = parseDeepLink(buildFilmDeepLink(FILM_LINK));

  assert.deepEqual(target, {
    kind: 'navigate',
    screen: FILM_SCREEN,
    params: { link: FILM_LINK },
  });
});

test('app scheme film links survive a link with no genre segment', () => {
  const link = '/films/1-avatar-2009.html';

  assert.deepEqual(parseDeepLink(buildFilmDeepLink(link))?.kind, 'navigate');
});

test('app scheme links that are not films do not navigate', () => {
  assert.equal(parseDeepLink('lumen://home'), null);
  assert.equal(parseDeepLink('lumen://film/'), null);
  // an encoded path that is not a film page must not reach the film screen
  assert.equal(parseDeepLink(buildFilmDeepLink('/announce')), null);
});

test('https links keep working', () => {
  const target = parseDeepLink(`https://rezka.ag${FILM_LINK}`);

  assert.deepEqual(target, {
    kind: 'navigate',
    screen: FILM_SCREEN,
    params: { link: FILM_LINK },
  });
});
