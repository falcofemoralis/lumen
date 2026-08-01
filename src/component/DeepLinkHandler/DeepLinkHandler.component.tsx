import { parseDeepLink } from 'Api/linking';
import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { openLinkInBrowser } from 'Util/Link';
import { push } from 'Util/Navigation';

/**
 * Listens for incoming deep links (both cold start and while running) and
 * either navigates to the matching screen or hands the link off to the
 * external browser.
 *
 * Rendered inside the NavigationContainer so navigation is ready. Renders
 * nothing.
 */
export const DeepLinkHandler = () => {
  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) {
        return;
      }

      const target = parseDeepLink(url);
      if (!target) {
        return;
      }

      if (target.kind === 'browser') {
        openLinkInBrowser(target.url);

        return;
      }

      push(target.screen, target.params);
    };

    // Cold start: the app was opened by a link.
    Linking.getInitialURL().then(handleUrl);

    // Warm: a link arrived while the app is already running.
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));

    return () => subscription.remove();
  }, []);

  return null;
};

export default DeepLinkHandler;
