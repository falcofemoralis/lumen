import { useIsTV } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { removeTvChannels, setTvChannelsBackgroundSync, syncTvChannels } from 'Util/TvChannels';

/**
 * Keeps the Android TV recommendations channels in step with the home screen tabs.
 *
 * There is no background worker behind this: fetching a tab means parsing the site,
 * which only the JS side knows how to do, so the channels are refreshed whenever the
 * app runs and are otherwise served from what the launcher already cached. The sync
 * itself is throttled, hence the unconditional call on every foreground.
 */
export const useTvChannels = (isEnabled: boolean) => {
  const isTV = useIsTV();
  const { currentService } = useServiceContext();
  const { isInternetAvailable } = useNetworkContext();
  // a sync walks every home tab, so overlapping runs would multiply the requests
  const isSyncingRef = useRef(false);
  const wasEnabledRef = useRef(isEnabled);

  useEffect(() => {
    if (!isTV || !isEnabled) {
      return () => {};
    }

    const sync = async () => {
      if (isSyncingRef.current) {
        return;
      }

      isSyncingRef.current = true;

      try {
        await syncTvChannels(currentService);
      } finally {
        isSyncingRef.current = false;
      }
    };

    if (isInternetAvailable) {
      sync();
    }

    // coming back from standby is the moment the cards are most likely stale, and on
    // a TV that is the only "app start" the user ever performs after the first one
    const subscription = AppState.addEventListener('focus', sync);

    return () => {
      subscription.remove();
    };
  }, [isTV, isEnabled, isInternetAvailable, currentService]);

  // The job is what keeps the rows fresh once the app is closed. Both calls are
  // idempotent, so this simply follows the setting on every start.
  useEffect(() => {
    if (isTV) {
      setTvChannelsBackgroundSync(isEnabled);
    }
  }, [isTV, isEnabled]);

  // Only on the transition, never on mount: the channels of a user who has the
  // feature switched off were already taken down when they switched it off, and
  // re-running that on every start would query the provider for nothing.
  useEffect(() => {
    const wasEnabled = wasEnabledRef.current;
    wasEnabledRef.current = isEnabled;

    if (isTV && wasEnabled && !isEnabled) {
      removeTvChannels();
    }
  }, [isTV, isEnabled]);
};
