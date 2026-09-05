import { useIsTV } from 'Context/ConfigContext';
import { useEffect } from 'react';
import { setTvSearchEnabled } from 'Util/TvSearch';

/**
 * Keeps the native side of the Android TV global search in step with the setting.
 *
 * There is nothing to sync here beyond the flag itself. Unlike the recommendations
 * channels, which have to be published ahead of time, the search has no content to keep
 * fresh: the suggestion provider runs the real search on demand, when the user asks for
 * something. What it cannot do is ask JS whether the feature is on - it is called
 * before there is a JS runtime - so the setting is mirrored to storage it can read.
 *
 * Applied on every change and on mount, and this is the only place that writes the
 * truth: the native flag starts out on so that search works before the app has been
 * opened after an update, which makes every run of this the correction for a device
 * where that guess was wrong - a phone, or a TV where the user switched it off.
 */
export const useTvSearch = (isEnabled: boolean) => {
  const isTV = useIsTV();

  useEffect(() => {
    setTvSearchEnabled(isTV && isEnabled);
  }, [isTV, isEnabled]);
};
