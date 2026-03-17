import { getFirestore } from '@react-native-firebase/firestore';
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
    const { isTV, isFirestore, playerAskQuality, sortVoicesByRating } = useConfigContext();
    const { selectedVoice: contextVoice, updateSelectedVoice } = usePlayerContext();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(
      voiceInput ?? voices.length > 0 ? voices.find(({ isActive }) => isActive) ?? voices[0] : {} as FilmVoiceInterface
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
      isFirestore && isSignedIn && !isOffline
        ? getFirestore().collection<FirestoreDocument>(FIRESTORE_DB)
        : null
    ), [isSignedIn, isFirestore, isOffline]);

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

      if (isSignedIn && !isOffline) {
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

    const handleSelectVoice = async (voiceId: string) => {
      const { hasSeasons } = film;
      const voice = voices.find(({ identifier }) => identifier === voiceId);

      if (!voice) {
        return;
      }

      if (!hasSeasons) {
        setSelectedVoice(voice);

        setIsLoading(true);

        try {
          const video = isOffline ? voice.video : await currentService
            .getFilmStreamsByVoice(film, voice);

          if (video) {
            handleSelectVideo(video, voice);
          }
        } catch (error) {
          NotificationStore.displayError(error as Error);
        } finally {
          setIsLoading(false);
        }

        return;
      }

      voiceOverlayRef?.current?.close();

      setTimeout(async () => {
        setIsLoading(true);

        try {
          const updatedVoice = isOffline ? voice : await currentService.getFilmSeasons(film, voice);

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
        } catch (error) {
          NotificationStore.displayError(error as Error);
        } finally {
          setIsLoading(false);
        }
      }, 0);
    };

    const handleSelectEpisode = async (episodeId: string) => {
      const { hasSeasons } = film;

      if (isDownloader) {
        const key = formatDownloadKey(selectedSeasonId, episodeId);

        setEpisodesToDownload((prev) => ({
          ...prev,
          [key]: !prev[key],
        }));

        return;
      }

      setSelectedEpisodeId(episodeId);
      setIsLoading(true);

      try {
        const video = isOffline
          ? selectedVoice.seasons?.find(({ seasonId }) => seasonId === selectedSeasonId)?.episodes?.find(
            ({ episodeId: eId }) => eId === episodeId
          )?.video
          : await currentService
            .getFilmStreamsByEpisodeId(
              film,
              selectedVoice,
              selectedSeasonId ?? '1',
              episodeId
            );

        const voice = {
          ...selectedVoice,
        };

        if (hasSeasons) {
          voice.lastSeasonId = selectedSeasonId;
          voice.lastEpisodeId = episodeId;
        }

        if (video) {
          handleSelectVideo(video, voice);
        }
      } catch (error) {
        NotificationStore.displayError(error as Error);
      } finally {
        setIsLoading(false);
      }
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

    const handleEpisodesDownload = async () => {
      downloadVideosRef.current = {};
      downloadVoicesRef.current = {};

      setIsLoading(true);

      for (const [key, value] of Object.entries(episodesToDownload)) {
        if (!value) {
          continue;
        }

        const [seasonId, episodeId] = key.split(',');

        const video = await currentService
          .getFilmStreamsByEpisodeId(
            film,
            selectedVoice,
            seasonId,
            episodeId
          );

        downloadVideosRef.current[key] = video;
        downloadVoicesRef.current[key] = {
          ...selectedVoice,
          lastSeasonId: seasonId,
          lastEpisodeId: episodeId,
        };
      }

      const allQualities = Object.values(downloadVideosRef.current).map(
        (video) => video.streams.map(({ quality }) => quality)
      );
      const commonQualities = allQualities.reduce(
        (a, b) => a.filter((c) => b.includes(c))
      );

      setStreamQualities(commonQualities);
      setIsLoading(false);

      qualityOverlayRef.current?.open();
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
