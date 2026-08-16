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
 * Applied on every change and on mount: the flag lives outside the JS config (in native
 * preferences), so this is what makes the two agree after an install or a restore.
 */
export const useTvSearch = (isEnabled: boolean) => {
  useEffect(() => {
    setTvSearchEnabled(isEnabled);
  }, [isEnabled]);
};
