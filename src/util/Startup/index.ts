/**
 * How long the startup path is left to itself before background work is let in.
 *
 * A cold start already has to fetch a home tab and parse the page it comes back in,
 * and on a weak TV box that parse owns the JS thread for a good while. Everything
 * else that fires on mount -- the update check, the user data behind the badge, the
 * recommendations sync (which fetches *every* home tab) -- competes with it for both
 * the thread and the connection while the user is looking at a skeleton.
 */
export const STARTUP_GRACE_MS = 2000;

/** Bundle evaluation, i.e. as close to "app start" as JS can observe. */
const startedAt = Date.now();

/**
 * Runs `task` once the app is past its startup burst.
 *
 * The grace period is measured from app start rather than from the call, so work
 * scheduled late (a fetch that only becomes possible once the network reading lands)
 * is not pushed back a second time.
 *
 * A plain timer is the entire mechanism on purpose. `InteractionManager` would be the
 * conventional answer, but as of RN 0.86 it is a stub: `runAfterInteractions` is a
 * bare `setImmediate` and `createInteractionHandle` returns -1 without recording
 * anything, so nothing in the app can hold a task back through it any more.
 *
 * @returns a cancel function, suitable for returning straight from an effect.
 */
export const runAfterStartup = (task: () => void): () => void => {
  const timeout = setTimeout(task, Math.max(0, STARTUP_GRACE_MS - (Date.now() - startedAt)));

  return () => clearTimeout(timeout);
};
