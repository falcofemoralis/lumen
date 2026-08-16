import ReactNativeTvChannelsModule from './ReactNativeTvChannelsModule';

export type TvProgramType = 'movie' | 'tv_series' | 'tv_episode' | 'clip';

export type TvPosterAspectRatio = 'movie_poster' | '16_9' | '3_2' | '4_3' | '1_1' | '2_3';

export interface TvProgramSpec {
  /** Unique within its channel and stable across syncs, ex. the film id. */
  providerId: string;
  title: string;
  /** Sent as-is when the card is selected, so it has to resolve to this app. */
  intentUri: string;
  description?: string;
  posterArtUri?: string;
  type?: TvProgramType;
  posterArtAspectRatio?: TvPosterAspectRatio;
  releaseDate?: string;
  genre?: string;
  live?: boolean;
}

export interface TvChannelSpec {
  /** Stable channel identity across syncs, ex. the home menu item id. */
  providerId: string;
  displayName: string;
  description?: string;
  /** Opened when the user selects the channel logo. */
  appLinkIntentUri?: string;
  /** Square, opaque logo. The app icon is used when this is not given. */
  logoUri?: string;
  programs: TvProgramSpec[];
}

export interface TvChannelInfo {
  id: number;
  providerId: string | null;
  displayName: string | null;
  /** Whether the channel is actually shown on the home screen. */
  isBrowsable: boolean;
}

/**
 * Recommendations channels on the Android TV home screen.
 *
 * @see https://developer.android.com/training/tv/discovery/recommendations-channel
 *
 * Every method except `requestChannelBrowsable` is a no-op on devices without the
 * TvProvider (phones, and TVs below Android 8.0), so callers only need `isSupported`
 * when they want to hide UI.
 */
class ReactNativeTvChannels {
  /** Android 8.0+ on a TV device. */
  isSupported(): boolean {
    return ReactNativeTvChannelsModule.isSupported();
  }

  /** The channels this app has published, including the ones the user hid. */
  getChannels(): Promise<TvChannelInfo[]> {
    return ReactNativeTvChannelsModule.getChannels();
  }

  /**
   * Creates the channels that do not exist yet, updates the rest and replaces their
   * programs. Safe to call on every app start - channels are matched by `providerId`.
   *
   * Only the first channel an app ever publishes becomes visible on its own; the
   * others stay hidden until the user enables them, either from the launcher's
   * "Customize channels" screen or through `requestChannelBrowsable`.
   */
  syncChannels(channels: TvChannelSpec[]): Promise<TvChannelInfo[]> {
    return ReactNativeTvChannelsModule.syncChannels(channels);
  }

  /** Removes published channels that are no longer wanted. Returns how many went away. */
  deleteChannelsExcept(providerIds: string[]): Promise<number> {
    return ReactNativeTvChannelsModule.deleteChannelsExcept(providerIds);
  }

  /** Removes every channel this app published. */
  deleteAllChannels(): Promise<number> {
    return ReactNativeTvChannelsModule.deleteChannelsExcept([]);
  }

  /**
   * Shows the system dialog asking to put a channel on the home screen, resolving to
   * whether the user accepted. Only valid while the app is in the foreground.
   */
  requestChannelBrowsable(channelId: number): Promise<boolean> {
    return ReactNativeTvChannelsModule.requestChannelBrowsable(channelId);
  }

  /**
   * Keeps a periodic job registered that refreshes the channels with the app closed,
   * by running the `TvChannelsSync` headless JS task. The job is `setPersisted`, so
   * it also survives a reboot.
   *
   * Idempotent: an already registered job with the same interval keeps running
   * rather than being restarted, so calling this on every app start does not push
   * the next run further and further away. Intervals below 15 minutes are raised to
   * it, since that is the shortest period JobScheduler accepts.
   *
   * @returns whether the job had to be (re)scheduled.
   */
  scheduleBackgroundSync(intervalMinutes: number): Promise<boolean> {
    return ReactNativeTvChannelsModule.scheduleBackgroundSync(intervalMinutes);
  }

  cancelBackgroundSync(): Promise<boolean> {
    return ReactNativeTvChannelsModule.cancelBackgroundSync();
  }
}

export const reactNativeTvChannels = new ReactNativeTvChannels();
