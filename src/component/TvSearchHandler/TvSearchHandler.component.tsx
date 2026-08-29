import { reactNativeTvSearch } from 'Modules/react-native-tv-search';
import { SEARCH_SCREEN, SEARCH_TAB, TABS_SCREEN } from 'Navigation/navigationRoutes';
import { useEffect } from 'react';
import { navigate } from 'Util/Navigation';
import { publishTvSearchRequest } from 'Util/TvSearch/request';

/**
 * Opens the search screen on a query the app was handed from outside it.
 *
 * This is the other half of the Android TV search integration: besides offering
 * suggestions to the global search box (see `Util/TvSearch`), the app declares itself a
 * searchable target, so a launcher offering to search within it can pass the query
 * straight over. Here it turns into an ordinary search, with the full paginated results
 * the screen always shows, rather than the handful of cards that fit in the search box.
 *
 * Rendered inside the NavigationContainer, next to DeepLinkHandler, for the same
 * reason: navigation has to exist before a query can open anything. Renders nothing.
 */
export const TvSearchHandler = () => {
  useEffect(() => {
    const openSearch = (query: string) => {
      // published before navigating, so a search screen that mounts as a result of the
      // navigation already finds the query waiting for it
      publishTvSearchRequest(query);

      // Deferred by a microtask. This effect runs while the NavigationContainer above
      // is still mounting - child effects run before the parent's - so the ref is not
      // ready yet and `navigate` would quietly drop the query. React flushes a commit's
      // effects in one synchronous pass, so anything queued here runs after the
      // container has marked itself ready. (DeepLinkHandler gets this for free: its
      // initial url arrives from a promise.)
      queueMicrotask(() => {
        navigate(TABS_SCREEN, {
          screen: SEARCH_TAB,
          params: { screen: SEARCH_SCREEN },
        });
      });
    };

    // Cold start: the app was opened by the search box.
    const initialQuery = reactNativeTvSearch.getInitialSearchQuery();

    if (initialQuery) {
      openSearch(initialQuery);
    }

    // Warm: a search arrived while the app was already running.
    const subscription = reactNativeTvSearch.addSearchRequestedListener(openSearch);

    return () => subscription.remove();
  }, []);

  return null;
};

export default TvSearchHandler;
