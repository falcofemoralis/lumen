import { APP_HOME_DEEP_LINK, buildFilmDeepLink } from 'Api/linking';
import { ApiInterface } from 'Api/type';
import {
  reactNativeTvChannels,
  TvChannelSpec,
  TvProgramSpec,
  TvProgramType,
} from 'Modules/react-native-tv-channels';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmType } from 'Type/FilmType.type';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { storage } from 'Util/Storage';

export const TV_CHANNELS_LAST_SYNC = 'TV_CHANNELS_LAST_SYNC';

/**
 * A home tab page holds ~36 films, so this takes the page whole in practice and
 * only guards against a provider that returns a much longer one - every card is a
 * provider row plus a poster the launcher downloads and caches.
 */
export const TV_CHANNEL_PROGRAMS_LIMIT = 50;

/** Channels are rebuilt at most this often, see {@link syncTvChannels}. */
export const TV_CHANNELS_SYNC_INTERVAL = 1000 * 60 * 60 * 4; // 4 hours

/** How often the background job refreshes the channels with the app closed. */
export const TV_CHANNELS_SYNC_JOB_INTERVAL_MINUTES = 4 * 60;

/**
 * Namespaced so a channel is never confused with one published under a different
 * scheme later on - the id is permanent for as long as the channel exists.
 */
const CHANNEL_PROVIDER_ID_PREFIX = 'home:';

/**
 * Series get the `tv_series` card treatment (the launcher labels them differently
 * and may show episode info); everything else is presented as a movie. Cartoons and
 * anime are not split any further because the category alone does not say whether a
 * given entry is a film or a show.
 */
const getProgramType = (type: FilmType): TvProgramType => (
  type === FilmType.SERIES || type === FilmType.TV_SHOW ? 'tv_series' : 'movie'
);

const toProgramSpec = (film: FilmCardInterface): TvProgramSpec => ({
  // the film id is what the site keys on; the link is a fallback for the rare card
  // that comes without one, and it is unique for the same reason
  providerId: film.id || film.link,
  title: film.title,
  intentUri: buildFilmDeepLink(film.link),
  description: film.subtitle || undefined,
  posterArtUri: film.poster || undefined,
  type: getProgramType(film.type),
  posterArtAspectRatio: 'movie_poster',
});

const buildChannelSpec = async (
  service: ApiInterface,
  menuItem: MenuItemInterface
): Promise<TvChannelSpec> => {
  const { films } = await service.getHomeMenuFilms(menuItem, 1);

  return {
    providerId: `${CHANNEL_PROVIDER_ID_PREFIX}${menuItem.id}`,
    displayName: menuItem.title,
    // there is no way to preselect a home tab from outside, so the logo just opens
    // the app on whichever tab it was left on
    appLinkIntentUri: APP_HOME_DEEP_LINK,
    programs: films
      // a card with no link has nothing to open, and the launcher would still show it
      .filter(({ link }) => !!link)
      .slice(0, TV_CHANNEL_PROGRAMS_LIMIT)
      .map(toProgramSpec),
  };
};

const getLastSync = (): number => {
  const value = storage.getMiscStorage().loadString(TV_CHANNELS_LAST_SYNC);

  return value ? Number(value) || 0 : 0;
};

export const isTvChannelsSyncDue = (): boolean => Date.now() - getLastSync() >= TV_CHANNELS_SYNC_INTERVAL;

/**
 * Publishes one recommendations channel per home menu item, each filled with the
 * first page of that tab.
 *
 * Every menu item is fetched, so this is throttled to {@link TV_CHANNELS_SYNC_INTERVAL}
 * unless `force` is passed. It never rejects: a home screen row failing to refresh is
 * not worth surfacing to the user, and the previously published cards stay up.
 *
 * @returns whether anything was published.
 */
export const syncTvChannels = async (
  service: ApiInterface,
  { force = false }: { force?: boolean } = {}
): Promise<boolean> => {
  if (!reactNativeTvChannels.isSupported() || (!force && !isTvChannelsSyncDue())) {
    return false;
  }

  try {
    const menuItems = service.getHomeMenu().filter(({ isHidden }) => !isHidden);

    const specs = (await Promise.all(menuItems.map((menuItem) => buildChannelSpec(service, menuItem))))
      // an empty channel is worse than no channel: the launcher keeps showing the row
      .filter(({ programs }) => programs.length > 0);

    if (!specs.length) {
      return false;
    }

    await reactNativeTvChannels.syncChannels(specs);

    // menu items only change when the service does, so this is close to a no-op, but
    // it keeps stale rows from lingering on the home screen forever
    await reactNativeTvChannels.deleteChannelsExcept(specs.map(({ providerId }) => providerId));

    storage.getMiscStorage().saveString(TV_CHANNELS_LAST_SYNC, String(Date.now()));

    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to sync the TV recommendations channels', error);
    }

    return false;
  }
};

/**
 * Registers (or drops) the job that refreshes the channels while the app is closed.
 * Both directions are idempotent, so this can just follow the setting.
 */
export const setTvChannelsBackgroundSync = async (isEnabled: boolean): Promise<void> => {
  if (!reactNativeTvChannels.isSupported()) {
    return;
  }

  try {
    if (isEnabled) {
      await reactNativeTvChannels.scheduleBackgroundSync(TV_CHANNELS_SYNC_JOB_INTERVAL_MINUTES);
    } else {
      await reactNativeTvChannels.cancelBackgroundSync();
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to update the TV recommendations channels background sync', error);
    }
  }
};

/** Drops every published channel and lets the next sync start from scratch. */
export const removeTvChannels = async (): Promise<void> => {
  if (!reactNativeTvChannels.isSupported()) {
    return;
  }

  try {
    await reactNativeTvChannels.deleteAllChannels();

    storage.getMiscStorage().remove(TV_CHANNELS_LAST_SYNC);
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to remove the TV recommendations channels', error);
    }
  }
};

/**
 * Walks the published channels the user has not accepted yet and shows the system
 * dialog for each one. Only the first channel an app publishes appears on the home
 * screen by itself; the rest need this (or a trip to the launcher's "Customize
 * channels" screen).
 *
 * @returns how many channels the user accepted.
 */
export const requestTvChannelsBrowsable = async (): Promise<number> => {
  if (!reactNativeTvChannels.isSupported()) {
    return 0;
  }

  const channels = await reactNativeTvChannels.getChannels();
  let accepted = 0;

  // strictly sequential: the launcher only puts up one dialog at a time
  for (const { id, isBrowsable } of channels) {
    if (isBrowsable) {
      continue;
    }

    if (await reactNativeTvChannels.requestChannelBrowsable(id)) {
      accepted += 1;
    }
  }

  return accepted;
};
