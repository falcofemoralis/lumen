import {
  completeHandler,
  getExistingDownloadTasks,
  setConfig as setDownloaderConfig,
} from '@kesha-antonov/react-native-background-downloader';
import { AppUpdater } from 'Component/AppUpdater';
import { CloudflareSolver } from 'Component/CloudflareSolver';
import { ZonaStreamProvider } from 'Component/ZonaStreamProvider';
import { Portal } from 'Component/ThemedPortal';
import { useAppUpdaterContext } from 'Context/AppUpdaterContext';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useAutoFrameRate } from 'Hooks/useAutoFrameRate';
import { useAwake } from 'Hooks/useAwake';
import { useSubtitleStyle } from 'Hooks/useSubtitleStyle';
import { useTvChannels } from 'Hooks/useTvChannels';
import { useTvSearch } from 'Hooks/useTvSearch';
import { useVolumeNormalization } from 'Hooks/useVolumeNormalization';
import { ReactNode, useEffect, useRef } from 'react';
import NotificationStore from 'Store/Notification.store';
import { Installer } from 'Util/App/installer';
import { runAfterStartup } from 'Util/Startup';
import { sourcePlaybackRouter, sourceRouter } from '../../source';



export const Root = ({ children }: { children: ReactNode }) => {
  const {
    checkForUpdates,
    isLocalLibrary,
    downloadsMaxParallel,
    isConfigured,
    tvChannelsEnabled,
    tvSearchEnabled,
    playerAutoFrameRateEnabled,
    playerAutoFrameRate,
    playerVolumeNormalizationEnabled,
    playerVolumeNormalization,
    playerVolumeNormalizationStrength,
  } = useConfigContext();
  const { isSignedIn } = useServiceContext();
  const zonaFullAdapterTestStarted = useRef(false);
  const { fetchUserData } = useServiceContext();
  const { checkVersion } = useAppUpdaterContext();
  const { isInternetAvailable } = useNetworkContext();
  useAwake();
  useTvChannels(tvChannelsEnabled);
  // gated on onboarding too: a search before a provider has been settled on only 404s,
  // and the searcher shows that as "this app found nothing" rather than as a failure
  useTvSearch(tvSearchEnabled && isConfigured);
  useAutoFrameRate(playerAutoFrameRateEnabled && playerAutoFrameRate);
  useVolumeNormalization(
    playerVolumeNormalizationEnabled && playerVolumeNormalization,
    playerVolumeNormalizationStrength
  );
  useSubtitleStyle();

  // Deferred: an update banner is not what the user opened the app for, so it has no
  // claim on the connection while the first screen is still filling in.
  useEffect(() => {
    if (!checkForUpdates || !isInternetAvailable) {
      return () => {};
    }

    return runAfterStartup(() => {
      checkVersion();
    });
  }, [checkForUpdates, checkVersion, isInternetAvailable]);

  // The APK an update downloaded is tens of megabytes and is useless once this
  // launch has happened - the install either went through or the user dropped
  // it - so reclaim the space here, where nothing can still be reading it.
  useEffect(() => runAfterStartup(() => {
    Installer.cleanupApk();
  }), []);

  // Deferred as well - this only feeds the tab bar's notification badge, which can
  // appear a moment after the tabs themselves do.
  useEffect(() => {
    // in local mode notifications derive from the public updates widget, so
    // they are fetched (and the badge recomputed) even while logged out
    if (!(isSignedIn || isLocalLibrary) || !isInternetAvailable) {
      return () => {};
    }

    return runAfterStartup(() => {
      fetchUserData();
    });
  }, [isSignedIn, isLocalLibrary, fetchUserData, isInternetAvailable]);

  // Applied on every change: the cap is read when a download looks for a free
  // slot, so raising it lets already queued downloads start without a restart,
  // and lowering it leaves running transfers alone.
  useEffect(() => {
    setDownloaderConfig({ maxParallelDownloads: downloadsMaxParallel });
  }, [downloadsMaxParallel]);

  useEffect(() => {
    if (zonaFullAdapterTestStarted.current) {
      return;
    }

    zonaFullAdapterTestStarted.current = true;

    void (async () => {
      const testLink = 'https://w1.zona.im/tvseries/mazhor';

      console.log('[ZONA FULL ADAPTER TEST] START');
      console.log('[ZONA FULL ADAPTER TEST] LINK', testLink);

      try {
        const sourceAdapter = sourceRouter.getAdapterForLink(testLink);

        if (!sourceAdapter) {
          throw new Error('Zona source adapter was not resolved');
        }

        console.log(
          '[ZONA FULL ADAPTER TEST] SOURCE ADAPTER',
          sourceAdapter.name,
          sourceAdapter.source,
        );

        const film = await sourceAdapter.getFilm(testLink);

        if (!film) {
          throw new Error('Zona getFilm() returned null');
        }

        console.log('[ZONA FULL ADAPTER TEST] FILM', {
          id: film.id,
          title: film.title,
          link: film.link,
          type: film.type,
          externalIds: film.externalIds,
        });

        const kinopoiskId = Number(film.externalIds?.kinopoisk);

        if (!Number.isFinite(kinopoiskId) || kinopoiskId <= 0) {
          throw new Error(
            `Invalid Kinopoisk ID: ${String(film.externalIds?.kinopoisk)}`,
          );
        }

        console.log(
          '[ZONA FULL ADAPTER TEST] KINOPOISK ID',
          kinopoiskId,
        );

        const playbackAdapter =
          sourcePlaybackRouter.getAdapterForFilmLink(film.link);

        if (!playbackAdapter) {
          throw new Error('Zona playback adapter was not resolved');
        }

        console.log(
          '[ZONA FULL ADAPTER TEST] PLAYBACK ADAPTER',
          playbackAdapter.source,
        );

        const voices =
          await playbackAdapter.getFilmVoices(film);

        console.log(
          '[ZONA FULL ADAPTER TEST] VOICES',
          voices.map(voice => ({
            id: voice.id,
            identifier: voice.identifier,
            title: voice.title,
            isActive: voice.isActive,
          })),
        );

        if (voices.length === 0) {
          throw new Error('Zona returned no voices');
        }

        const selectedVoice =
          voices.find(voice => voice.isActive) ?? voices[0];

        console.log(
          '[ZONA FULL ADAPTER TEST] SELECTED VOICE',
          selectedVoice,
        );

        const voiceWithSeasons =
          await playbackAdapter.getFilmSeasons(
            film,
            selectedVoice,
          );

        const seasons = voiceWithSeasons.seasons ?? [];

        console.log(
          '[ZONA FULL ADAPTER TEST] SEASONS',
          seasons.map(season => ({
            seasonId: season.seasonId,
            name: season.name,
            episodes: season.episodes.length,
          })),
        );

        if (seasons.length === 0) {
          throw new Error('Zona returned no seasons');
        }

        const season = seasons[0];

        if (season.episodes.length === 0) {
          throw new Error(
            `Zona season ${season.seasonId} returned no episodes`,
          );
        }

        const episode = season.episodes[0];

        console.log('[ZONA FULL ADAPTER TEST] EPISODE', {
          seasonId: season.seasonId,
          seasonName: season.name,
          episodeId: episode.episodeId,
          episodeName: episode.name,
        });

        const video =
          await playbackAdapter.getFilmStreamsByEpisodeId(
            film,
            voiceWithSeasons,
            season.seasonId,
            episode.episodeId,
          );

        console.log('[ZONA FULL ADAPTER TEST] VIDEO', {
          streams: video.streams?.length ?? 0,
          qualities: video.streams?.map(stream => stream.quality),
          firstUrl: video.streams?.[0]?.url,
        });

        if (!video.streams?.length) {
          throw new Error(
            'Zona playback returned no normalized streams',
          );
        }

        console.log('[ZONA FULL ADAPTER TEST] SUCCESS');
      } catch (error) {
        console.error('[ZONA FULL ADAPTER TEST] FAILED', error);
      }
    })();
  }, []);

  useEffect( () => {
    getExistingDownloadTasks().then(tasks => {
      tasks.forEach(task => {
        task
          .done(() => {
            completeHandler(task.id);
          })
          .error(({ error }) => {
            NotificationStore.displayError(error);
            completeHandler(task.id);
          });
      });
    });
  }, []);

  return (
    // App-wide portal host: the updater sits outside any Page, so its overlay
    // has no page host to portal into. Wrapping both here also keeps the
    // portaled content mounted after { children }, so it paints above the page.
    <Portal.Host>
      <AppUpdater />
      { children }
      { /*
         * Draws nothing until a request hits a Cloudflare bot check - see the container.
         * Last, and so painted over the page: unlike the updater above it puts its own
         * view up rather than portaling one, and the request behind it is blocked until
         * the user has answered it.
         */ }
      <CloudflareSolver />
      <ZonaStreamProvider />
    </Portal.Host>
  );
};

export default Root;



