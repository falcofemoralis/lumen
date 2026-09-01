import { pause, resume } from '@noriginmedia/norigin-spatial-navigation-core';
import { ThemedText } from 'Component/ThemedText';
import { useIsTV } from 'Context/ConfigContext';
import { useThemedStyles } from 'Hooks/useThemedStyles';
import { t } from 'i18n/translate';
import { setNativeFocusTrapReleased } from 'Navigation/NativeFocusTrap';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  AUTO_SOLVE_TIMEOUT_MS,
  CloudflareSolveOutcome,
  harvestClearance,
  POLL_INTERVAL_MS,
  SOLVE_TIMEOUT_MS,
} from 'Util/Cloudflare';
import { safeJsonParse } from 'Util/Json';
import { setIntervalSafe, setTimeoutSafe } from 'Util/Misc';

import { CHALLENGE_PROBE_SCRIPT } from './CloudflareSolver.config';
import { componentStyles } from './CloudflareSolver.style';
import { CloudflareProbeMessage, CloudflareSolverComponentProps } from './CloudflareSolver.type';

/**
 * Works one Cloudflare challenge in a WebView the user can see and reach.
 *
 * There is nothing to compute here the way there is for Anubis: the check runs
 * obfuscated JS and grades the browser that runs it, so the only way through it is to
 * be a browser. This loads the origin in one, lets the challenge run, and lifts the
 * clearance cookie out of the WebView's store into the app's jar.
 *
 * On screen rather than hidden, because a hidden one cannot finish the job: past the
 * plain "checking your browser" case, Cloudflare escalates to a checkbox that wants a
 * real click, and a view with no size and no pointer events can never be given one. It
 * is also the honest thing to show -- the request behind it is blocked until this is
 * answered, and a bot check the user can watch is one they can act on.
 *
 * It settles the moment the clearance cookie appears rather than when the page
 * finishes -- the cookie is the whole point, and Cloudflare hands it over before it
 * redirects.
 */
export const CloudflareSolverComponent = ({ request, onSettled }: CloudflareSolverComponentProps) => {
  const { origin, userAgent } = request;
  const styles = useThemedStyles(componentStyles);
  const isTV = useIsTV();
  const insets = useSafeAreaInsets();
  const [needsUser, setNeedsUser] = useState(false);
  // Every path here races the others -- the poll, the page reporting in, the clock,
  // the user backing out -- and only the first one is the answer.
  const isSettled = useRef(false);

  const settle = useCallback((outcome: CloudflareSolveOutcome) => {
    if (isSettled.current) {
      return;
    }

    isSettled.current = true;
    onSettled(request, outcome);
  }, [onSettled, request]);

  useEffect(() => {
    const poll = setIntervalSafe(() => {
      harvestClearance(origin).then((cleared) => {
        if (cleared) {
          settle('passed');
        }
      });
    }, POLL_INTERVAL_MS);

    // Not a failure, just the point at which this stops looking like something that
    // will finish by itself -- so say what the user can do about it.
    const prompt = setTimeoutSafe(() => {
      setNeedsUser(true);
    }, AUTO_SOLVE_TIMEOUT_MS);

    const timeout = setTimeoutSafe(() => {
      settle('failed');
    }, SOLVE_TIMEOUT_MS);

    return () => {
      if (poll !== null) {
        clearInterval(poll);
      }

      if (prompt !== null) {
        clearTimeout(prompt);
      }

      if (timeout !== null) {
        clearTimeout(timeout);
      }
    };
  }, [origin, settle]);

  // The page has to be driven by the native focus engine while it is up: its controls
  // are drawn by the browser and are invisible to the app's spatial navigation, which
  // would otherwise keep steering the screen underneath. `NativeFocusTrap` holds real
  // focus on a dead-end view by default, so both have to stand down.
  useEffect(() => {
    if (!isTV) {
      return () => {};
    }

    pause();
    setNativeFocusTrapReleased(true);

    return () => {
      setNativeFocusTrapReleased(false);
      resume();
    };
  }, [isTV]);

  // Back gets out of a check the user cannot or does not want to finish, rather than
  // leaving them with a page and no way off it until the cap runs out.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      settle('cancelled');

      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [settle]);

  // The page saying it is no longer a challenge is the fast path off a check that lets
  // us through without issuing a clearance cookie. Only ever settles in the affirmative:
  // a probe that misreads a challenge page as an ordinary one would otherwise fail the
  // solve outright, where leaving it to the poll and the clock costs only time.
  const onMessage = useCallback((event: WebViewMessageEvent) => {
    const message = safeJsonParse<CloudflareProbeMessage>(event.nativeEvent.data);

    if (!message || message.challenge) {
      return;
    }

    harvestClearance(origin).then((cleared) => {
      if (cleared) {
        settle('passed');
      }
    });
  }, [origin, settle]);

  return (
    // It covers the whole screen, the status bar included, so the heading has to be
    // kept out from under it -- there is no page chrome here to do that already.
    <View style={ [styles.overlay, { paddingTop: insets.top }] }>
      <View style={ styles.header }>
        <ThemedText style={ styles.title }>
          { t('Verifying that you are not a robot') }
        </ThemedText>
        <ThemedText style={ styles.origin }>
          { origin }
        </ThemedText>
        <ThemedText style={ styles.hint }>
          { needsUser ? t('Complete the check to continue, or press Back to cancel')
            : t('This can take a few seconds') }
        </ThemedText>
      </View>
      <WebView
        style={ styles.webView }
        source={ { uri: origin } }
        // Clearance is issued against the user agent that earned it, so a cookie taken
        // from a WebView announcing itself differently is refused on the app's very next
        // request -- and the app would challenge in a loop.
        userAgent={ userAgent }
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        // The store has to be the shared one, or the cookie dies with this view.
        incognito={ false }
        originWhitelist={ ['*'] }
        // A challenge that tries to open a window gets nothing to open it into, rather
        // than stalling on a request for a window this host will never provide.
        setSupportMultipleWindows={ false }
        injectedJavaScript={ CHALLENGE_PROBE_SCRIPT }
        onMessage={ onMessage }
        focusable
        hasTVPreferredFocus
      />
    </View>
  );
};

export default CloudflareSolverComponent;
