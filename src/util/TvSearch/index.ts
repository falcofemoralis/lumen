import { buildFilmDeepLink } from 'Api/linking';
import { ApiInterface } from 'Api/type';
import { reactNativeTvSearch, TvSearchResult } from 'Modules/react-native-tv-search';
import { FilmCardInterface } from 'Type/FilmCard.interface';

/**
 * How many cards one search offers the global search box. It shows a handful and the
 * rest are only reachable by opening the app, where the search screen fetches its own
 * (paginated) results anyway - so publishing the whole page would mostly be rows the
 * launcher downloads a poster for and never draws.
 */
export const TV_SEARCH_RESULTS_LIMIT = 20;

/** A film card's subtitle leads with the release year, ex. "2023, США, Драма". */
const YEAR_REGEXP = /\b(?:19|20)\d{2}\b/;

/**
 * The search UI groups results by what they lead to, and only treats an app as a video
 * source when its rows say so. The cards open a film page rather than a stream, but the
 * type describes the content behind them, which is video either way.
 */
const CONTENT_TYPE = 'video/mp4';

const toSearchResult = (film: FilmCardInterface): TvSearchResult => {
  const year = film.subtitle.match(YEAR_REGEXP)?.[0];

  return {
    // the film id is what the site keys on; the link is a fallback for the rare card
    // that comes without one, and it is unique for the same reason
    id: film.id || film.link,
    title: film.title,
    intentData: buildFilmDeepLink(film.link),
    subtitle: film.subtitle || undefined,
    posterUri: film.poster || undefined,
    contentType: CONTENT_TYPE,
    productionYear: year ? Number(year) : undefined,
  };
};

/**
 * Runs the query the global search box was asked for and publishes what it finds.
 *
 * This is the ordinary search - the same call the search screen makes - and it is the
 * whole reason the feature reaches back into JS instead of being served natively from
 * a pre-built index: the results are whatever the service actually returns, for
 * anything the user can think to search for.
 *
 * A failure is deliberately left to propagate rather than published as "no results":
 * an empty publish records the query as searched and would keep the next few keystrokes
 * from retrying it, which is the wrong answer for a request that merely timed out.
 *
 * @returns how many results were published.
 */
export const runTvSearchQuery = async (service: ApiInterface, query: string): Promise<number> => {
  const trimmed = query.trim();

  if (!trimmed) {
    return 0;
  }

  const { films } = await service.search(trimmed, 1);

  const results = films
    // a card with no link has nothing to open, and the search UI would still show it
    .filter(({ link }) => !!link)
    .slice(0, TV_SEARCH_RESULTS_LIMIT)
    .map(toSearchResult);

  await reactNativeTvSearch.publishResults(trimmed, results);

  return results.length;
};

/**
 * Mirrors the setting to the native side, which is what actually switches the feature
 * on: the content provider is called before there is a JS runtime to ask, so it reads a
 * persisted flag. Switching off also drops the cached results.
 */
export const setTvSearchEnabled = async (isEnabled: boolean): Promise<void> => {
  try {
    await reactNativeTvSearch.setEnabled(isEnabled);
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to update the TV global search setting', error);
    }
  }
};

/** Drops the cached results, ex. when the content behind them is no longer the same. */
export const clearTvSearchResults = async (): Promise<void> => {
  try {
    await reactNativeTvSearch.clearResults();
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to clear the TV global search results', error);
    }
  }
};
