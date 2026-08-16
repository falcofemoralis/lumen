import { EventSubscription } from 'expo-modules-core';

import ReactNativeTvSearchModule from './ReactNativeTvSearchModule';

export interface TvSearchResult {
  /** Unique within its query, ex. the film id. */
  id: string;
  title: string;
  /** Opened as an ACTION_VIEW when the card is selected, so it has to resolve to this app. */
  intentData: string;
  subtitle?: string;
  posterUri?: string;
  /** Mime type of what the card leads to, ex. `video/mp4`. */
  contentType?: string;
  productionYear?: number;
}

/**
 * The app's content in the Android TV global search box.
 *
 * @see https://developer.android.com/training/tv/discovery/searchable
 *
 * The system reads suggestions from a content provider, on a binder thread, once per
 * keystroke, and will not wait for a network search - so the provider answers from a
 * small cache and asks JS to run the real search in the background. That search is an
 * ordinary `service.search()` call, run by the `TvSearchQuery` headless task, and
 * {@link publishResults} is what hands the results back and makes the search UI pick
 * them up.
 *
 * Everything here is a no-op on devices without a TV search box, so callers only need
 * `isSupported` when they want to hide UI.
 */
class ReactNativeTvSearch {
  /** Whether the device has a global search box that consults app providers, i.e. a TV. */
  isSupported(): boolean {
    return ReactNativeTvSearchModule.isSupported();
  }

  /**
   * Mirrors the user's setting natively.
   *
   * The provider runs before there is a JS runtime to ask, so it reads a persisted
   * flag instead - which means this has to be called for the feature to do anything at
   * all. Switching it off also drops the cached results.
   */
  async setEnabled(isEnabled: boolean): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    await ReactNativeTvSearchModule.setEnabled(isEnabled);
  }

  /**
   * Stores what a search found and notifies the search UI, which re-reads the cursor it
   * was given and shows the results in place of whatever it had.
   *
   * An empty list is worth publishing: it records that the query was searched and came
   * back with nothing, which is what stops the following keystrokes from searching it
   * over and over.
   */
  async publishResults(query: string, results: TvSearchResult[]): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    await ReactNativeTvSearchModule.publishResults(query, results);
  }

  /** Drops every cached result, ex. after the content provider changed underneath them. */
  async clearResults(): Promise<void> {
    if (!this.isSupported()) {
      return;
    }

    await ReactNativeTvSearchModule.clearResults();
  }

  /**
   * The query the app was launched with, when it was opened by the launcher's search
   * rather than by the user, and `null` otherwise.
   *
   * Consumed as it is read, so a second call (a remount, a rotation) returns `null`
   * rather than re-running a search the user has already navigated away from.
   */
  getInitialSearchQuery(): string | null {
    return ReactNativeTvSearchModule.getInitialSearchQuery();
  }

  /** A search arriving while the app is already running, ex. the search key on the remote. */
  addSearchRequestedListener(listener: (query: string) => void): EventSubscription {
    return ReactNativeTvSearchModule.addListener(
      'onSearchRequested',
      ({ query }) => listener(query)
    );
  }
}

export const reactNativeTvSearch = new ReactNativeTvSearch();
