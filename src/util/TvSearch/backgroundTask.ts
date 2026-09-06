import { DEFAULT_SERVICE, services } from 'Api/index';
import { getGlobalConfig } from 'Context/ConfigContext';
import NotificationStore from 'Store/Notification.store';

import { runTvSearchQuery, setTvSearchEnabled } from '.';

/** Must match `TASK_KEY` in TvSearchLiveQuery.kt. */
export const TV_SEARCH_QUERY_TASK = 'TvSearchQuery';

/**
 * Runs one search on behalf of the Android TV global search box.
 *
 * Started by the suggestion provider through a headless JS runtime, so there is no
 * React tree, no navigation and no contexts - only module scope. Everything the search
 * needs (config, cookies, the parser) reads straight from storage or is pure, which is
 * what makes running it outside the app possible at all.
 *
 * The app is usually not open when this runs: the user is on the launcher's home
 * screen typing into the search box, and this process was started for that.
 */
export const tvSearchQueryTask = async ({ query }: { query: string }): Promise<void> => {
  const { isTV, isConfigured, tvSearchEnabled } = getGlobalConfig();

  // searching before onboarding has settled on a provider only produces a 404, and
  // the launcher would show the failure as "no results" for the app
  if (!isTV || !isConfigured || !tvSearchEnabled || !query) {
    // The native flag starts out on, so that search works right after an update rather
    // than only once the app has been opened again. On an install nobody has opened
    // that assumption is wrong, and this is the first moment anything can tell: turning
    // it off stops the next search from starting the app for nothing. Opening the app
    // turns it back on, since that is when the setting is known for real.
    await setTvSearchEnabled(false);

    return;
  }

  // the fetch can hit an Anubis challenge, which reports its failures with a toast -
  // and there is no app on screen here for one to belong to
  NotificationStore.setSilent(true);

  try {
    await runTvSearchQuery(services[DEFAULT_SERVICE], query);
  } catch (error) {
    // nothing is published, so the query stays unsearched and the next keystroke
    // retries it - which is the right answer for a request that just failed
    if (__DEV__) {
      console.warn('Failed to run the TV global search query', error);
    }
  } finally {
    NotificationStore.setSilent(false);
  }
};
