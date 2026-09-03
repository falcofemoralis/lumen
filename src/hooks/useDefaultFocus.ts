import { doesFocusableExist, getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import { NavigationContext } from '@react-navigation/native';
import { useNavigationContext } from 'Context/NavigationContext';
import { useIsInsideOverlay, useOverlayContext } from 'Context/OverlayContext';
import { useCallback, useContext, useEffect, useRef } from 'react';

// The target focusable may register a few frames after the screen is revealed
// (react-native-screens re-runs effects when an Activity/Offscreen screen becomes
// visible again, and Norigin registers in a passive effect that can land after
// our focus attempt). Retry across a short window instead of giving up.
const MAX_CLAIM_ATTEMPTS = 20;

/**
 * Focuses `focusKey` when the enclosing navigation screen gains focus -- on the
 * first load and again every time the user returns to the screen (back from a
 * film view, reload after an error boundary, tab re-entry, screen reveal ...),
 * unless the user had already moved focus elsewhere inside the screen before
 * leaving it, in which case they are put back where they were instead.
 *
 * Claims focus at most once per screen visit, so it never steals focus back
 * while the screen stays focused (menu tab switches, pagination, re-renders).
 *
 * `enabled` doubles as a readiness signal: Norigin can only focus a node that is
 * already registered, so keep it `false` until the target is mounted and ready
 * to receive focus (e.g. after data has loaded). It also lets a screen elect a
 * single default target among several (e.g. menu vs. grid) by enabling one.
 *
 * Safe to use outside a navigator (e.g. inside a portal/overlay, where the
 * navigation context is lost): it falls back to a one-shot focus on mount.
 *
 * Claims are held back while the sidebar menu or an overlay owns focus, and
 * retried once it lets go.
 */
export function useDefaultFocus(focusKey: string, enabled = true) {
  const isScreenFocusedRef = useRef(false);
  const hasClaimedRef = useRef(false);

  // While the sidebar menu holds focus, a screen must not pull focus into its
  // content: that would collapse the menu the instant a tab navigates, leaving
  // the user unable to browse on to another tab.
  const { isMenuOpen } = useNavigationContext();

  // Same for an open overlay: it owns focus while it is up, so a page-level
  // default must not yank focus out from under it when its data finally arrives
  // (e.g. the home films loading behind the app updater). Targets rendered
  // inside the overlay are exempt -- they are its own default focus.
  const { isOverlayOpen } = useOverlayContext();
  const isInsideOverlay = useIsInsideOverlay();

  const isDeferred = isMenuOpen || (isOverlayOpen && !isInsideOverlay);

  // Latest values, so the stable callbacks/effects below always read current
  // props without re-subscribing the focus listeners mid-visit.
  const focusKeyRef = useRef(focusKey);
  const enabledRef = useRef(enabled);
  const isDeferredRef = useRef(isDeferred);

  useEffect(() => {
    focusKeyRef.current = focusKey;
    enabledRef.current = enabled;
    isDeferredRef.current = isDeferred;
  }, [focusKey, enabled, isDeferred]);

  // Pending retry frame for a claim whose target isn't registered yet.
  const rafRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);

  // Where focus sat inside the screen when the user left it, so returning lands
  // there instead of on the default target. Consumed by the first claim of the
  // visit; `null` once used, or when there is nothing of ours to restore.
  const restoreFocusKeyRef = useRef<string | null>(null);

  const cancelPendingClaim = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const claim = useCallback(() => {
    // Hoisted so the retry frame can reference it without a use-before-declared
    // cycle.
    function attempt() {
      rafRef.current = null;

      // Not our turn: stop any retry loop and bail.
      if (!isScreenFocusedRef.current || hasClaimedRef.current || !enabledRef.current) {
        cancelPendingClaim();

        return;
      }

      // Something else owns focus (open menu or overlay): defer without
      // consuming the per-visit guard, so the claim still happens later -- the
      // effect below re-attempts once the menu closes or the overlay goes away.
      if (isDeferredRef.current) {
        cancelPendingClaim();

        return;
      }

      /**
       * The user is coming back to a screen they had already navigated inside
       * (opened a film from a grid card, then pressed back). Norigin does not
       * restore that focus on its own -- the focused card never unmounted, the
       * screen it belongs to simply stopped being the focused route -- and
       * claiming the default target here would drag the user back to the top of
       * the screen (e.g. the pager menu) every single time. Put them back on
       * what they left instead, and count it as this visit's claim.
       */
      const restoreFocusKey = restoreFocusKeyRef.current;

      if (restoreFocusKey) {
        restoreFocusKeyRef.current = null;

        // A target that is gone (the screen reloaded, the grid was refreshed
        // under it) leaves nothing to go back to -- fall through to the default.
        if (restoreFocusKey !== focusKeyRef.current && doesFocusableExist(restoreFocusKey)) {
          hasClaimedRef.current = true;
          cancelPendingClaim();
          setFocus(restoreFocusKey);

          return;
        }
      }

      if (doesFocusableExist(focusKeyRef.current)) {
        hasClaimedRef.current = true;
        cancelPendingClaim();
        setFocus(focusKeyRef.current);

        return;
      }

      // Target not registered yet -- retry on the next frame, bounded so we
      // never spin forever when the key genuinely never appears.
      if (attemptsRef.current < MAX_CLAIM_ATTEMPTS) {
        attemptsRef.current += 1;
        cancelPendingClaim();
        rafRef.current = requestAnimationFrame(attempt);
      }
    }

    attempt();
  }, [cancelPendingClaim]);

  // Attempt the claim with a fresh retry budget, WITHOUT clearing the per-visit
  // guard -- if we already claimed this visit, attempt() bails, so readiness
  // changes never steal focus back (e.g. a menu tab switch that reloads films).
  const attemptClaim = useCallback(() => {
    attemptsRef.current = 0;
    claim();
  }, [claim]);

  // Retry the claim when the target, its readiness, or what currently owns focus
  // changes within the current visit -- e.g. data finished loading after the
  // screen was already focused, the user finally left the sidebar, or the
  // overlay that was covering the screen closed.
  useEffect(() => {
    if (isScreenFocusedRef.current) {
      attemptClaim();
    }
  }, [focusKey, enabled, isDeferred, attemptClaim]);

  // NavigationContext is undefined when rendered outside a navigator (portals
  // break React context), so read it directly instead of useNavigation(), which
  // would throw.
  const navigation = useContext(NavigationContext);

  useEffect(() => {
    const onFocus = () => {
      // A genuine screen focus starts a new visit: clear the per-visit guard so
      // we claim exactly once, then attempt.
      isScreenFocusedRef.current = true;
      hasClaimedRef.current = false;
      attemptClaim();
    };

    const onBlur = () => {
      isScreenFocusedRef.current = false;

      // Remember what the user was on, to come back to it. Focus that had
      // already left the screen is not ours to restore: a tab switch leaves
      // from the sidebar and an overlay owns focus while it is up, and coming
      // back to either of those instead of the screen's own default target is
      // exactly the wrong place to land.
      restoreFocusKeyRef.current = isDeferredRef.current ? null : getCurrentFocusKey() ?? null;

      cancelPendingClaim();
    };

    // No navigator: treat as permanently "focused" and claim once on mount.
    if (!navigation) {
      onFocus();

      return () => {
        onBlur();
      };
    }

    if (navigation.isFocused()) {
      onFocus();
    }

    const unsubscribeFocus = navigation.addListener('focus', onFocus);
    const unsubscribeBlur = navigation.addListener('blur', onBlur);

    return () => {
      onBlur();
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation, attemptClaim, cancelPendingClaim]);
}
