import { collection, CollectionReference, getFirestore } from '@react-native-firebase/firestore';
import { useMutation } from '@tanstack/react-query';
import { sourcePlaybackRouter } from '../../source';
import { FIRESTORE_DB } from 'Component/Player/Player.config';
import { FirestoreDocument, SavedTime } from 'Component/Player/Player.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerContext } from 'Context/PlayerContext';
import { useServiceContext } from 'Context/ServiceContext';
import { t } from 'i18n/translate';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { DownloadLinkInterface } from 'Type/DownloadLink.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';
import { getFirestoreSavedTime, getSavedTime, setSavedTime as setSavedTimeStorage } from 'Util/Player';
import { combineSavedTime } from 'Util/Player/savedTimeUtil';

import PlayerVideoSelectorComponent from './PlayerVideoSelector.component';
import FilmVideoSelectorComponentTV from './PlayerVideoSelector.component.atv';
import { formatDownloadKey, PROGRESS_THRESHOLD_MAX, PROGRESS_THRESHOLD_MIN } from './PlayerVideoSelector.config';
import { PlayerVideoSelectorContainerProps } from './PlayerVideoSelector.type';

export type PlayerVideoSelectorRef = {
  open: () => void;
  close: () => void;
};

export const PlayerVideoSelectorContainer = forwardRef<PlayerVideoSelectorRef, PlayerVideoSelectorContainerProps>(
  (
    {
      film,
      voice: voiceInput,
      isDownloader,
      isOffline,
      onSelect,
      onClose,
      onDownloadSelect,
      onVoicesUpdate,
    },
    ref
  ) => {
    const { voices = [] } = film;
    const {
      isTV,
      isFirestore,
      isLocalLibrary,
      playerAskQuality,
      playerCompactSelector,
      sortVoicesByRating,
    } = useConfigContext();
    const { selectedVoice: contextVoice, updateSelectedVoice } = usePlayerContext();
    const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(
      // eslint-disable-next-line max-len
      voiceInput ?? (voices.length > 0 ? voices.find(({ isActive }) => isActive) ?? voices[0] : {} as FilmVoiceInterface)
    );
    const { isSignedIn, profile, currentService } = useServiceContext();

    const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
      !isOffline ? selectedVoice.lastSeasonId : '1'
    );
    const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | undefined>(
      !isOffline ? selectedVoice.lastEpisodeId : '1'
    );
    const [savedTime, setSavedTime] = useState<SavedTime | null>(null);
    const firestoreDb = useMemo(() => (
      isFirestore && isSignedIn && !isOffline && !isLocalLibrary
        ? collection(getFirestore(), FIRESTORE_DB) as CollectionReference<FirestoreDocument>
        : null
    ), [isSignedIn, isFirestore, isOffline, isLocalLibrary]);

    const firestoreSavedTimeRef = useRef(false);
    const overlayRef = useRef<ThemedOverlayRef>(null);
    const voiceOverlayRef = useRef<ThemedOverlayRef>(null);
    const qualityOverlayRef = useRef<ThemedOverlayRef>(null);

    const [episodesToDownload, setEpisodesToDownload] = useState<Record<string, boolean>>({});

    const [streamQualities, setStreamQualities] = useState<string[] | null>(null);
    const downloadVideosRef = useRef<Record<string, FilmVideoInterface> | null>(null);
    const downloadVoicesRef = useRef<Record<string, FilmVoiceInterface | null>>(null);

    const selectedVideosRef = useRef<FilmVideoInterface | null>(null);
    const selectedVoicesRef = useRef<FilmVoiceInterface | null>(null);

    const zonaVoiceDiscoveryRef = useRef(false);

    useEffect(() => {
      zonaVoiceDiscoveryRef.current = false;
    }, [film.link]);

    const isMountedRef = useRef(false);

    const [isVoiceDiscoveryLoading, setIsVoiceDiscoveryLoading] = useState(false);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    useImperativeHandle(ref, () => ({
      open: async () => {
        setIsSelectorOpen(true);
        overlayRef.current?.open();
        const playbackAdapter = sourcePlaybackRouter.getAdapterForFilmLink(film.link);
        if (isOffline || !playbackAdapter || zonaVoiceDiscoveryRef.current) return;
        zonaVoiceDiscoveryRef.current = true;
        setIsVoiceDiscoveryLoading(true);
        try {
          const discovered = await playbackAdapter.getFilmVoices(film);
          if (discovered.length) {
            const current = getContextVoice() ?? selectedVoice;
            const next = discovered.find((voice) => voice.identifier === current?.identifier)
              ?? discovered.find((voice) => voice.isActive) ?? discovered[0];
            setSelectedVoice(next);
            onVoicesUpdate?.(discovered);
          } else {
            zonaVoiceDiscoveryRef.current = false;
          }
        } catch (error) {
          zonaVoiceDiscoveryRef.current = false;
          NotificationStore.displayError(error as Error);
        } finally {
          setIsVoiceDiscoveryLoading(false);
          zonaVoiceDiscoveryRef.current = false;
        }
      },
      close: () => { setIsSelectorOpen(false); overlayRef.current?.close(); },
    }));
    const supplementedLinkRef = useRef<string | undefined>(undefined);
    useEffect(() => {
      const supplementalLink = film.metadataSourceFilm?.link;
      if (!isSelectorOpen || isVoiceDiscoveryLoading || !supplementalLink
        || supplementedLinkRef.current === supplementalLink) return;
      const adapter = sourcePlaybackRouter.getAdapterForFilmLink(film.link);
      if (!adapter || isOffline) return;
      supplementedLinkRef.current = supplementalLink;
      let cancelled = false;
      void adapter.getFilmVoices(film).then((updated) => {
        if (!cancelled && updated.length) onVoicesUpdate?.(updated);
      }).catch(() => { supplementedLinkRef.current = undefined; });
      return () => { cancelled = true; supplementedLinkRef.current = undefined; };
    }, [film.link, film.metadataSourceFilm?.link, isSelectorOpen, isVoiceDiscoveryLoading, isOffline, onVoicesUpdate]);

    const getContextVoice = () => {
      const { id } = film;

      const { filmId, voice } = contextVoice || {};

      if (filmId === id && voice) {
        return voice;
      }

      return null;
    };

    const getSavedVoiceData = (saved: SavedTime | null, voiceId: string) => (
      saved?.voices?.[voiceId] ?? null
    );

    const getSavedSelection = (
      voice: FilmVoiceInterface,
      saved: SavedTime | null
    ) => {
      const voiceData = getSavedVoiceData(saved, voice.id);

      return {
        seasonId: voiceData?.lastSeasonId ?? voice.lastSeasonId,
        episodeId: voiceData?.lastEpisodeId ?? voice.lastEpisodeId,
      };
    };

    const persistSelection = (
      voice: FilmVoiceInterface,
      seasonId?: string,
      episodeId?: string
    ) => {
      const currentSavedTime = savedTime ?? getSavedTime(film);

      const nextSavedTime: SavedTime = currentSavedTime
        ? {
          ...currentSavedTime,
          voices: { ...currentSavedTime.voices },
        }
        : {
          filmId: film.id,
          voices: {},
          lastVoiceId: null,
        };

      const previousVoiceData = nextSavedTime.voices[voice.id];

      nextSavedTime.voices[voice.id] = {
        timestamps: previousVoiceData?.timestamps ?? {},
        lastSeasonId: seasonId ?? previousVoiceData?.lastSeasonId,
        lastEpisodeId: episodeId ?? previousVoiceData?.lastEpisodeId,
      };

      nextSavedTime.lastVoiceId = voice.id;

      setSavedTime(nextSavedTime);
      setSavedTimeStorage(nextSavedTime, film);
    };

    const applySavedSelection = (saved: SavedTime | null) => {
      if (!saved?.lastVoiceId) {
        return;
      }

      const savedVoice = voices.find(({ id }) => id === saved.lastVoiceId);

      if (!savedVoice) {
        return;
      }

      const savedSelection = getSavedSelection(savedVoice, saved);

      const activeVoice = voiceInput?.id === savedVoice.id ? voiceInput : getContextVoice();
      setSelectedVoice((previous) => ({
        ...savedVoice,
        seasons: activeVoice?.id === savedVoice.id && activeVoice.seasons?.length ? activeVoice.seasons
          : previous.id === savedVoice.id && previous.seasons?.length ? previous.seasons : savedVoice.seasons,
      }));
      setSelectedSeasonId(savedSelection.seasonId);
      setSelectedEpisodeId(savedSelection.episodeId);
    };
    const initFirestoreSavedTime = async () => {
      if (firestoreSavedTimeRef.current || !firestoreDb || !profile) {
        return;
      }

      firestoreSavedTimeRef.current = true;
      const fireStoreSavedTime = await getFirestoreSavedTime(film, profile, firestoreDb);

      if (fireStoreSavedTime) {
        const combinedSavedTime = combineSavedTime(savedTime, fireStoreSavedTime);

        if (combinedSavedTime) {
          setSavedTime(combinedSavedTime);
          setSavedTimeStorage(combinedSavedTime, film);
          applySavedSelection(combinedSavedTime);
        }
      }
    };

    /**
     * if user selected another voice\season\episode directly in the player
     */
    useEffect(() => {
      const voice = getContextVoice();

      if (!voice) {
        return;
      }

      const currentVoice = voices.find(
        ({ identifier }) => identifier === voice.identifier,
      );

      if (!currentVoice) {
        return;
      }

      setSelectedVoice({ ...currentVoice, ...voice, seasons: voice.seasons?.length ? voice.seasons : currentVoice.seasons });
      setSelectedSeasonId(voice.lastSeasonId ?? currentVoice.lastSeasonId);
      setSelectedEpisodeId(voice.lastEpisodeId ?? currentVoice.lastEpisodeId);
    }, [contextVoice, voices]);

    /**
     * Sync selectedVoice when film.voices is updated
     */
    useEffect(() => {
      if (voices.length === 0 || !isMountedRef.current) {
        isMountedRef.current = true;

        return;
      }

      const updatedVoice = voices.find(
        ({ identifier }) => identifier === selectedVoice.identifier,
      );

      if (updatedVoice && updatedVoice !== selectedVoice) {
        setSelectedVoice((previous) => ({
          ...updatedVoice,
          seasons: updatedVoice.seasons?.length ? updatedVoice.seasons : previous.seasons,
          lastSeasonId: previous.lastSeasonId ?? updatedVoice.lastSeasonId,
          lastEpisodeId: previous.lastEpisodeId ?? updatedVoice.lastEpisodeId,
        }));
      }
    }, [voices, selectedVoice.identifier]);

    useEffect(() => {
      if (!voiceInput) return;
      setSelectedVoice((previous) => ({
        ...voiceInput,
        seasons: voiceInput.seasons?.length ? voiceInput.seasons
          : previous.id === voiceInput.id ? previous.seasons : undefined,
      }));
      setSelectedSeasonId(voiceInput.lastSeasonId);
      setSelectedEpisodeId(voiceInput.lastEpisodeId);
    }, [voiceInput]);

    const getSeasons = (): SeasonInterface[] => {
      const { seasons = [] } = selectedVoice ?? {};

      return seasons;
    };

    const getEpisodes = (): EpisodeInterface[] => {
      const { seasons = [] } = selectedVoice ?? {};

      const { episodes = [] } = seasons.find(({ seasonId }) => seasonId === selectedSeasonId) ?? {};

      return episodes;
    };

    const handleSelectVideo = (video: FilmVideoInterface, voice: FilmVoiceInterface) => {
      if (!video.streams?.length) {
        NotificationStore.displayMessage(t('No video streams available'));
        return;
      }
      if (isDownloader) {
        if (!downloadVideosRef.current || !downloadVoicesRef.current) {
          downloadVideosRef.current = {};
          downloadVoicesRef.current = {};
        }

        downloadVideosRef.current['0'] = video;
        downloadVoicesRef.current['0'] = voice;

        setStreamQualities(video.streams.map(({ quality }) => quality));
        qualityOverlayRef.current?.open();

        return;
      }

      if (isSignedIn && !isOffline && !isLocalLibrary) {
        currentService.saveWatch(film, voice)
          .catch((error) => {
            NotificationStore.displayError(error as Error);
          });
      }

      if (playerAskQuality) {
        selectedVideosRef.current = video;
        selectedVoicesRef.current = voice;
        setStreamQualities(video.streams.map(({ quality }) => quality));
        qualityOverlayRef.current?.open();
      } else {
        onSelect(video, voice);
      }

      if (getContextVoice()) {
        // if store voice was updated, re update it
        updateSelectedVoice(film.id, voice);
      }
    };

    /** Movies: resolve the single video for a voice and hand it straight to the player */
    const { mutate: loadVoiceVideo, isPending: isVoiceVideoLoading } = useMutation({
      mutationFn: async (voice: FilmVoiceInterface) => {
        if (isOffline) {
          return voice.video;
        }

        const playbackAdapter =
          sourcePlaybackRouter.getAdapterForFilmLink(film.link);

        return playbackAdapter
          ? playbackAdapter.getFilmStreamsByVoice(film, voice)
          : currentService.getFilmStreamsByVoice(film, voice);
      },
      onSuccess: (video, voice) => {
        if (video) {
          handleSelectVideo(video, voice);
        }
      },
    });

    /** Series: resolve the season list for a voice and preselect its first episode */
    const [isAutoLoadingSeasons, setIsAutoLoadingSeasons] = useState(false);
    const { mutate: loadVoiceSeasons, isPending: isVoiceSeasonsLoading } = useMutation({
      mutationFn: async (voice: FilmVoiceInterface) => {
        if (isOffline) {
          return voice;
        }

        const playbackAdapter =
          sourcePlaybackRouter.getAdapterForFilmLink(film.link);

        return playbackAdapter
          ? playbackAdapter.getFilmSeasons(film, voice)
          : currentService.getFilmSeasons(film, voice);
      },
      onSuccess: (updatedVoice) => {
        setIsAutoLoadingSeasons(false);
        setSelectedVoice(updatedVoice);

        if (isDownloader) {
          setEpisodesToDownload({});
        }

        const { seasons = [] } = updatedVoice;

        if (seasons.length === 0) {
          persistSelection(updatedVoice);
          return;
        }

        const currentSavedTime = savedTime ?? getSavedTime(film);
        const savedSelection = getSavedSelection(updatedVoice, currentSavedTime);

        const currentSeason = seasons.find(
          ({ seasonId }) => seasonId === selectedSeasonId
        );

        const savedSeason = seasons.find(
          ({ seasonId }) => seasonId === savedSelection.seasonId
        );

        const season = currentSeason ?? savedSeason ?? seasons[0];
        const { seasonId, episodes = [] } = season;

        const currentEpisode = episodes.find(
          ({ episodeId }) => episodeId === selectedEpisodeId
        );

        const savedEpisode = episodes.find(
          ({ episodeId }) => episodeId === savedSelection.episodeId
        );

        const episode = currentEpisode ?? savedEpisode ?? episodes[0];
        const episodeId = episode?.episodeId;

        setSelectedSeasonId(seasonId);
        setSelectedEpisodeId(episodeId);

        persistSelection(updatedVoice, seasonId, episodeId);
      },
      onError: () => {
        setIsAutoLoadingSeasons(false);
      },
    });

    const autoLoadedSeasonsVoiceRef = useRef<string | null>(null);

    /**
     * Cloud Sync can restore a selected voice without its season/episode data.
     * Resolve seasons automatically for series before the selector needs them.
     */
    useEffect(() => {
      if (
        isOffline
        || !isSelectorOpen
        || isVoiceDiscoveryLoading
        || !film.hasSeasons
        || !selectedVoice?.id
        || selectedVoice.seasons?.some((season) =>
          season.seasonId === (selectedSeasonId ?? selectedVoice.lastSeasonId ?? selectedVoice.seasons?.[0]?.seasonId)
          && season.episodes?.length)
        || autoLoadedSeasonsVoiceRef.current === selectedVoice.id + ':' + (selectedSeasonId ?? '')
      ) {
        return;
      }

      autoLoadedSeasonsVoiceRef.current = selectedVoice.id + ':' + (selectedSeasonId ?? '');
      setIsAutoLoadingSeasons(true);
      loadVoiceSeasons(selectedVoice);
    }, [film.hasSeasons, isOffline, isSelectorOpen, isVoiceDiscoveryLoading, loadVoiceSeasons, selectedVoice, selectedSeasonId]);
    const { mutate: loadEpisodeVideo, isPending: isEpisodeVideoLoading } = useMutation({
      mutationFn: ({
        voice,
        seasonId,
        episodeId,
      }: { voice: FilmVoiceInterface, seasonId: string, episodeId: string }) => {
        if (isOffline) {
          return Promise.resolve(
            voice.seasons?.find(({ seasonId: sId }) => sId === seasonId)?.episodes?.find(
              ({ episodeId: eId }) => eId === episodeId
            )?.video
          );
        }

        const playbackAdapter =
          sourcePlaybackRouter.getAdapterForFilmLink(film.link);

        return playbackAdapter
          ? playbackAdapter.getFilmStreamsByEpisodeId(film, voice, seasonId, episodeId)
          : currentService.getFilmStreamsByEpisodeId(film, voice, seasonId, episodeId);
      },
      onSuccess: (video, { voice, seasonId, episodeId }) => {
        if (!video) {
          return;
        }

        const selectedVideoVoice = { ...voice };

        if (film.hasSeasons) {
          selectedVideoVoice.lastSeasonId = seasonId;
          selectedVideoVoice.lastEpisodeId = episodeId;
        }

        handleSelectVideo(video, selectedVideoVoice);
      },
    });

    const handleSelectVoice = (voiceId: string) => {
      const { hasSeasons } = film;
      const voice = voices.find(({ identifier }) => identifier === voiceId);

      if (!voice) {
        return;
      }

      if (!hasSeasons) {
        setSelectedVoice(voice);
        persistSelection(voice);
        loadVoiceVideo(voice);

        return;
      }

      voiceOverlayRef?.current?.close();

      // let the overlay finish closing before the list underneath re-renders
      setTimeout(() => {
        loadVoiceSeasons(voice);
      }, 0);
    };

    const handleSelectSeason = (seasonId: string) => {
      setSelectedSeasonId(seasonId);

      const season = (selectedVoice.seasons ?? []).find(
        ({ seasonId: currentSeasonId }) => currentSeasonId === seasonId
      );

      const episodeId = season?.episodes?.[0]?.episodeId;

      setSelectedEpisodeId(episodeId);
      persistSelection(selectedVoice, seasonId, episodeId);
    };

    const handleSelectEpisode = (episodeId: string) => {
      if (isDownloader) {
        const key = formatDownloadKey(selectedSeasonId, episodeId);

        setEpisodesToDownload((prev) => ({
          ...prev,
          [key]: !prev[key],
        }));

        return;
      }

      setSelectedEpisodeId(episodeId);
      const seasonId = selectedSeasonId ?? '1';

      persistSelection(selectedVoice, seasonId, episodeId);
      loadEpisodeVideo({
        seasonId,
        voice: selectedVoice,
        episodeId,
      });
    };

    const calculateProgressThreshold = (progress: number): number => {
      if (progress < PROGRESS_THRESHOLD_MIN) {
        return 0;
      }

      if ((100 - progress) < PROGRESS_THRESHOLD_MAX) {
        return 100;
      }

      return progress;
    };

    const onOverlayOpen = () => {
      autoLoadedSeasonsVoiceRef.current = null;
      if (isOffline) {
        return;
      }

      const storedSavedTime = getSavedTime(film);

      setSavedTime(storedSavedTime);
      applySavedSelection(storedSavedTime);
      initFirestoreSavedTime();
    };

    const { mutate: loadEpisodesToDownload, isPending: isDownloadLoading } = useMutation({
      mutationFn: async (selectedEpisodes: string[]) => {
        const videos: Record<string, FilmVideoInterface> = {};
        const voicesByKey: Record<string, FilmVoiceInterface> = {};

        for (const key of selectedEpisodes) {
          const [seasonId, episodeId] = key.split(',');

          const playbackAdapter =
            sourcePlaybackRouter.getAdapterForFilmLink(film.link);

          videos[key] = await (
            playbackAdapter
              ? playbackAdapter.getFilmStreamsByEpisodeId(
                  film,
                  selectedVoice,
                  seasonId,
                  episodeId
                )
              : currentService.getFilmStreamsByEpisodeId(
                  film,
                  selectedVoice,
                  seasonId,
                  episodeId
                )
          );

          voicesByKey[key] = {
            ...selectedVoice,
            lastSeasonId: seasonId,
            lastEpisodeId: episodeId,
          };
        }

        return { videos, voicesByKey };
      },
      onSuccess: ({ videos, voicesByKey }) => {
        downloadVideosRef.current = videos;
        downloadVoicesRef.current = voicesByKey;

        const [firstQualities = [], ...restQualities] = Object.values(videos).map(
          (video) => video.streams.map(({ quality }) => quality)
        );
        const commonQualities = restQualities.reduce(
          (a, b) => a.filter((c) => b.includes(c)),
          firstQualities
        );

        if (!commonQualities.length) {
          NotificationStore.displayMessage(t('No video streams available'));

          return;
        }

        setStreamQualities(commonQualities);

        qualityOverlayRef.current?.open();
      },
    });

    const handleEpisodesDownload = () => {
      downloadVideosRef.current = {};
      downloadVoicesRef.current = {};

      const selectedEpisodes = Object.entries(episodesToDownload)
        .filter(([, value]) => value)
        .map(([key]) => key);

      if (!selectedEpisodes.length) {
        NotificationStore.displayMessage(t('No episodes selected'));

        return;
      }

      loadEpisodesToDownload(selectedEpisodes);
    };

    const handleDownload = async (quality: string) => {
      const downloadVideos = downloadVideosRef.current;
      const downloadVoices = downloadVoicesRef.current;

      if (!downloadVideos || !downloadVoices) {
        NotificationStore.displayMessage(t('No video available'));

        return;
      }

      const videos = Object.entries(downloadVideos);
      const links: DownloadLinkInterface[] = [];

      for (const [key, video] of Object.entries(downloadVideos)) {
        const voice = downloadVoices[key];

        const stream = video.streams.find(({ quality: q }) => q === quality);
        if (!stream) {
          NotificationStore.displayMessage(t('No video streams available for {{key}}', { key }));

          return;
        }

        links.push({
          url: stream.url,
          quality: stream.quality,
          headers: stream.headers,
          subtitles: video.subtitles,
          seasonId: voice?.lastSeasonId,
          episodeId: voice?.lastEpisodeId,
          voice: voice,
        });
      }

      if (links.length !== videos.length) {
        return;
      }

      if (onDownloadSelect) {
        onDownloadSelect(links);
      }

      setStreamQualities(null);
      setEpisodesToDownload({});

      qualityOverlayRef.current?.close();
      overlayRef.current?.close();
    };

    const handleQualitySelect = (quality: string) => {
      if (!selectedVideosRef.current || !selectedVoicesRef.current) {
        NotificationStore.displayMessage(t('No video available'));

        return;
      }

      onSelect(selectedVideosRef.current, selectedVoicesRef.current, quality);

      qualityOverlayRef.current?.close();
      selectedVideosRef.current = null;
      selectedVoicesRef.current = null;
    };

    const sortedVoices = useMemo(() => {
      if (!sortVoicesByRating) {
        return voices;
      }

      const { voiceRating = [] } = film;
      if (!voiceRating.length) {
        return voices;
      }

      const sorted = [...voices].sort((a, b) => {
        const aRating = voiceRating.find(({ title }) => title === a.title)?.rating ?? 0;
        const bRating = voiceRating.find(({ title }) => title === b.title)?.rating ?? 0;

        return bRating - aRating;
      });

      return sorted;
    }, [voices, sortVoicesByRating, film]);

    const isLoading = isVoiceDiscoveryLoading || isVoiceVideoLoading
      || isVoiceSeasonsLoading
      || isEpisodeVideoLoading
      || isDownloadLoading
      || isAutoLoadingSeasons;

    const containerProps = {
      overlayRef,
      film,
      voices: sortedVoices,
      isLoading,
      selectedVoice,
      selectedSeasonId,
      selectedEpisodeId,
      seasons: getSeasons(),
      episodes: getEpisodes(),
      savedTime,
      voiceOverlayRef,
      isDownloader,
      isOffline,
      episodesToDownload,
      qualityOverlayRef,
      streamQualities,
      playerAskQuality,
      playerCompactSelector,
      handleSelectVoice,
      handleSelectSeason,
      setSelectedSeasonId,
      handleSelectEpisode,
      calculateProgressThreshold,
      onOverlayOpen,
      onClose: () => { setIsSelectorOpen(false); onClose?.(); },
      handleEpisodesDownload,
      handleDownload,
      handleQualitySelect,
    };

    // eslint-disable-next-line max-len
    return isTV ? <FilmVideoSelectorComponentTV { ...containerProps } /> : <PlayerVideoSelectorComponent { ...containerProps } />;
  }
);

export default PlayerVideoSelectorContainer;
