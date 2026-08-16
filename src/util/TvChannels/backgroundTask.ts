import { DEFAULT_SERVICE, services } from 'Api/index';
import { getGlobalConfig } from 'Context/ConfigContext';
import { initI18n } from 'i18n/index';
import i18n from 'i18next';
import NotificationStore from 'Store/Notification.store';

import { syncTvChannels } from '.';

/** Must match `TASK_KEY` in TvChannelsSyncJobService.kt. */
export const TV_CHANNELS_SYNC_TASK = 'TvChannelsSync';

/**
 * Refreshes the recommendations channels with the app closed.
 *
 * Run by a JobScheduler job through a headless JS runtime, so there is no React
 * tree, no navigation and no contexts - only module scope. Everything it needs
 * (config, cookies, the parser) reads straight from storage or is pure, which is the
 * whole reason the refresh stayed in JS instead of being rebuilt natively.
 */
export const tvChannelsSyncTask = async (): Promise<void> => {
  const { isTV, isConfigured, tvChannelsEnabled } = getGlobalConfig();

  // `isConfigured` is what says a provider has actually been picked - onboarding
  // sets `isTV` on its first slide, long before there is anything to fetch from
  if (!isTV || !isConfigured || !tvChannelsEnabled) {
    return;
  }

  // nothing has set the translations up in a headless runtime, and the channel
  // names are the (translated) home menu titles
  if (!i18n.isInitialized) {
    await initI18n();
  }

  // the fetch can hit an Anubis challenge, which reports its failures with a toast -
  // and there is no app on screen here for one to belong to
  NotificationStore.setSilent(true);

  try {
    // the job's own period is the refresh cadence, so the in-app throttle - which is
    // there to keep every window focus from re-fetching - would only skip work here
    await syncTvChannels(services[DEFAULT_SERVICE], { force: true });
  } finally {
    NotificationStore.setSilent(false);
  }
};
