import { getFirestore } from '@react-native-firebase/firestore';
import { FIRESTORE_DB } from 'Component/Player/Player.config';
import { FirestoreDocument, SavedTime } from 'Component/Player/Player.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { usePlayerContext } from 'Context/PlayerContext';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useEffect, useMemo, useRef, useState } from 'react';
import ConfigStore from 'Store/Config.store';
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';
import { getFirestoreSavedTime, getSavedTime, setSavedTime as setSavedTimeStorage } from 'Util/Player';
import { combineSavedTime } from 'Util/Player/savedTimeUtil';

import PlayerVideoSelectorComponent from './PlayerVideoSelector.component';
import FilmVideoSelectorComponentTV from './PlayerVideoSelector.component.atv';
import { PROGRESS_THRESHOLD_MAX, PROGRESS_THRESHOLD_MIN } from './PlayerVideoSelector.config';
import { PlayerVideoSelectorContainerProps } from './PlayerVideoSelector.type';

export function PlayerVideoSelectorContainer({
  overlayRef,
  film,
  voice: voiceInput,
  onSelect,
  onClose,
}: PlayerVideoSelectorContainerProps) {
  const { voices = [] } = film;
  const { selectedVoice: contextVoice, updateSelectedVoice } = usePlayerContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(
    voiceInput ?? voices.find(({ isActive }) => isActive) ?? voices[0]
  );
  const { isSignedIn, profile, currentService } = useServiceContext();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
    selectedVoice.lastSeasonId
  );
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | undefined>(
    selectedVoice.lastEpisodeId
  );
  const [savedTime, setSavedTime] = useState<SavedTime | null>(null);
  const firestoreDb = useMemo(() => (
    ConfigStore.isFirestore() && isSignedIn
      ? getFirestore().collection<FirestoreDocument>(FIRESTORE_DB)
      : null
  ), [isSignedIn]);
  const firestoreSavedTimeRef = useRef(false);
  const voiceOverlayRef = useRef<ThemedOverlayRef>(null);

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

  const getSeasons = (): SeasonInterface[] => {
    const { seasons = [] } = selectedVoice;

    return seasons;
  };

  const getEpisodes = (): EpisodeInterface[] => {
    const { seasons = [] } = selectedVoice;

    const { episodes = [] } = seasons.find(({ seasonId }) => seasonId === selectedSeasonId) ?? {};

    return episodes;
  };

  const handleSelectVideo = (video: FilmVideoInterface, voice: FilmVoiceInterface) => {
    if (isSignedIn) {
      currentService.saveWatch(film, voice)
        .catch((error) => {
          LoggerStore.error('handleSelectVideoSaveWatch', { error });

          NotificationStore.displayError(error as Error);
        });
    }

    onSelect(video, voice);

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
        const video = await currentService
          .getFilmStreamsByVoice(film, voice);

        handleSelectVideo(video, voice);
      } catch (error) {
        LoggerStore.error('handleSelectVoiceNoSeasons', { error });

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
        const updatedVoice = await currentService.getFilmSeasons(film, voice);

        setSelectedVoice(updatedVoice);

        const { seasons = [] } = updatedVoice;

        if (seasons.length > 0) {
          const season = seasons[0];
          const { seasonId, episodes: [{ episodeId }] = [] } = season;
          setSelectedSeasonId(seasonId);
          setSelectedEpisodeId(episodeId);
        }
      } catch (error) {
        LoggerStore.error('handleSelectVoice', { error });

        NotificationStore.displayError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  const handleSelectEpisode = async (episodeId: string) => {
    const { hasSeasons } = film;

    setSelectedEpisodeId(episodeId);
    setIsLoading(true);

    try {
      const video = await currentService
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

      handleSelectVideo(video, voice);
    } catch (error) {
      LoggerStore.error('handleSelectEpisode', { error });

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
    setSavedTime(getSavedTime(film));
    initFirestoreSavedTime();
  };

  const containerProps = () => ({
    overlayRef,
    film,
    voices,
    isLoading,
    selectedVoice,
    selectedSeasonId,
    selectedEpisodeId,
    seasons: getSeasons(),
    episodes: getEpisodes(),
    savedTime,
    voiceOverlayRef,
  });

  const containerFunctions = {
    handleSelectVoice,
    setSelectedSeasonId,
    handleSelectEpisode,
    calculateProgressThreshold,
    onOverlayOpen,
    onClose,
  };

  return withTV(FilmVideoSelectorComponentTV, PlayerVideoSelectorComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerVideoSelectorContainer;
