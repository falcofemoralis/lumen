import { collection, CollectionReference, getFirestore } from '@react-native-firebase/firestore';
import { useMutation } from '@tanstack/react-query';
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
    },
    ref
  ) => {
    const { voices = [] } = film;
    const { isTV, isFirestore, isLocalLibrary, playerAskQuality, sortVoicesByRating } = useConfigContext();
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

    const isMountedRef = useRef(false);

    useImperativeHandle(ref, () => ({
      open: () => {
        const { hasVoices, hasSeasons } = film;

        if (hasVoices || hasSeasons) {
          overlayRef.current?.open();

          return;
        }

        const voice = voices[0];
        const { video } = voice;

        if (!video) {
          NotificationStore.displayMessage(t('No video streams available'));

          return;
        }

        handleSelectVideo(video, voice);
      },
      close: () => {
        overlayRef.current?.close();
      },
    }));

    const getContextVoice = () => {
      const { id } = film;

      const { filmId, voice } = contextVoice || {};

      if (filmId === id && voice) {
        return voice;
      }

      return null;
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
        }
      }
    };

    /**
     * if user selected another voice\season\episode directly in the player
     */
    useEffect(() => {
      const voice = getContextVoice();

      if (voice) {
        setSelectedVoice(voice);
        setSelectedSeasonId(voice.lastSeasonId);
        setSelectedEpisodeId(voice.lastEpisodeId);
      }
    }, [contextVoice]);

    /**
     * Sync selectedVoice when film.voices is updated
     */
    useEffect(() => {
      if (voices.length === 0 || !isMountedRef.current) {
        isMountedRef.current = true;

        return;
      }

      const updatedVoice = voices.find(({ identifier }) => identifier === selectedVoice.identifier);

      if (updatedVoice && updatedVoice !== selectedVoice) {
        setSelectedVoice(updatedVoice);
      }
    }, [film]);

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
      mutationFn: (voice: FilmVoiceInterface) => (
        isOffline
          ? Promise.resolve(voice.video)
          : currentService.getFilmStreamsByVoice(film, voice)
      ),
      onSuccess: (video, voice) => {
        if (video) {
          handleSelectVideo(video, voice);
        }
      },
    });

    /** Series: resolve the season list for a voice and preselect its first episode */
    const { mutate: loadVoiceSeasons, isPending: isVoiceSeasonsLoading } = useMutation({
      mutationFn: (voice: FilmVoiceInterface) => (
        isOffline ? Promise.resolve(voice) : currentService.getFilmSeasons(film, voice)
      ),
      onSuccess: (updatedVoice) => {
        setSelectedVoice(updatedVoice);

        if (isDownloader) {
          setEpisodesToDownload({});
        }

        const { seasons = [] } = updatedVoice;

        if (seasons.length > 0) {
          const season = seasons[0];
          const { seasonId, episodes: [{ episodeId }] = [] } = season;
          setSelectedSeasonId(seasonId);
          setSelectedEpisodeId(episodeId);
        }
      },
    });

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

        return currentService.getFilmStreamsByEpisodeId(film, voice, seasonId, episodeId);
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
        loadVoiceVideo(voice);

        return;
      }

      voiceOverlayRef?.current?.close();

      // let the overlay finish closing before the list underneath re-renders
      setTimeout(() => {
        loadVoiceSeasons(voice);
      }, 0);
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

      loadEpisodeVideo({
        voice: selectedVoice,
        seasonId: selectedSeasonId ?? '1',
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
      if (!isOffline) {
        setSavedTime(getSavedTime(film));
        initFirestoreSavedTime();
      }
    };

    const { mutate: loadEpisodesToDownload, isPending: isDownloadLoading } = useMutation({
      mutationFn: async (selectedEpisodes: string[]) => {
        const videos: Record<string, FilmVideoInterface> = {};
        const voicesByKey: Record<string, FilmVoiceInterface> = {};

        for (const key of selectedEpisodes) {
          const [seasonId, episodeId] = key.split(',');

          videos[key] = await currentService
            .getFilmStreamsByEpisodeId(
              film,
              selectedVoice,
              seasonId,
              episodeId
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

    const isLoading = isVoiceVideoLoading
      || isVoiceSeasonsLoading
      || isEpisodeVideoLoading
      || isDownloadLoading;

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
      handleSelectVoice,
      setSelectedSeasonId,
      handleSelectEpisode,
      calculateProgressThreshold,
      onOverlayOpen,
      onClose,
      handleEpisodesDownload,
      handleDownload,
      handleQualitySelect,
    };

    // eslint-disable-next-line max-len
    return isTV ? <FilmVideoSelectorComponentTV { ...containerProps } /> : <PlayerVideoSelectorComponent { ...containerProps } />;
  }
);

export default PlayerVideoSelectorContainer;
