/**
 * Carries a search query from the Android TV search intent to the search screen.
 *
 * The two cannot simply be wired together: when the launcher hands the app a query the
 * screen usually does not exist yet - the app is being started for it - and when it
 * does exist it is already mounted, so there is nothing to seed. So a request is both
 * parked for whoever mounts next and announced to whoever is already listening,
 * whichever applies.
 *
 * Route params would be the obvious alternative and are not used on purpose: acting on
 * one means writing state from an effect, and re-searching the same term would need a
 * nonce to look like a new param at all.
 */

type Listener = (query: string) => void;

const listeners = new Set<Listener>();

let pendingQuery = '';

/**
 * Hands a query to the search screen, whether or not it is mounted.
 *
 * Parked first, so a screen that mounts as a result of this call picks it up through
 * {@link consumeTvSearchRequest} rather than missing it by a frame.
 */
export const publishTvSearchRequest = (query: string): void => {
  const trimmed = query.trim();

  if (!trimmed) {
    return;
  }

  pendingQuery = trimmed;

  listeners.forEach((listener) => listener(trimmed));
};

/**
 * The query the search screen should open on, if it was opened by a search. Cleared as
 * it is read, so remounting the screen later does not re-run a search the user has
 * since moved on from.
 */
export const consumeTvSearchRequest = (): string => {
  const query = pendingQuery;

  pendingQuery = '';

  return query;
};

/** For a search screen that is already mounted. Returns its unsubscribe function. */
export const subscribeToTvSearchRequests = (listener: Listener): () => void => {
  const wrapped: Listener = (query) => {
    // the mounted screen is about to act on the query, so it is taken out of the way
    // of anything that mounts afterwards
    consumeTvSearchRequest();
    listener(query);
  };

  listeners.add(wrapped);

  return () => {
    listeners.delete(wrapped);
  };
};
