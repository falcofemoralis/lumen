import { useOverlayContext } from 'Context/OverlayContext';
import { usePlayerContext } from 'Context/PlayerContext';
import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { EpisodeInterface, FilmVoiceInterface, SeasonInterface } from 'Type/FilmVoice.interface';

import PlayerVideoSelectorComponent from './PlayerVideoSelector.component';
import FilmVideoSelectorComponentTV from './PlayerVideoSelector.component.atv';
import { PlayerVideoSelectorContainerProps } from './PlayerVideoSelector.type';

export function PlayerVideoSelectorContainer({
  overlayId,
  film,
  voice: voiceInput,
  onHide,
  onSelect,
}: PlayerVideoSelectorContainerProps) {
  const { voices = [] } = film;
  const { selectedVoice: contextVoice, updateSelectedVoice } = usePlayerContext();
  const { goToPreviousOverlay } = useOverlayContext();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(
    voiceInput ?? voices.find(({ isActive }) => isActive) ?? voices[0]
  );
  const { isSignedIn, getCurrentService } = useServiceContext();

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>(
    selectedVoice.lastSeasonId
  );
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | undefined>(
    selectedVoice.lastEpisodeId
  );

  const getStoreVoice = () => {
    const { id } = film;

    const { filmId, voice } = contextVoice || {};

    if (filmId === id && voice) {
      return voice;
    }

    return null;
  };

  /**
   * In case if user selected another voice\season\episode directly in the player
   */
  useEffect(() => {
    const voice = getStoreVoice();

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
      getCurrentService().saveWatch(film, voice)
        .catch((error) => {
          NotificationStore.displayError(error as Error);
        });
    }

    onSelect(video, voice);

    if (getStoreVoice()) {
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
        const video = await getCurrentService()
          .getFilmStreamsByVoice(film, voice);

        handleSelectVideo(video, voice);
      } catch (error) {
        NotificationStore.displayError(error as Error);
      } finally {
        setIsLoading(false);
      }

      return;
    }

    goToPreviousOverlay();

    setTimeout(async () => {
      setIsLoading(true);

      try {
        const updatedVoice = await getCurrentService().getFilmSeasons(film, voice);

        setSelectedVoice(updatedVoice);

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

    setSelectedEpisodeId(episodeId);
    setIsLoading(true);

    try {
      const video = await getCurrentService()
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
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerProps = () => ({
    overlayId,
    voices,
    onHide,
    isLoading,
    selectedVoice,
    selectedSeasonId,
    selectedEpisodeId,
    seasons: getSeasons(),
    episodes: getEpisodes(),
    film,
  });

  const containerFunctions = {
    handleSelectVoice,
    setSelectedSeasonId,
    handleSelectEpisode,
  };

  return withTV(FilmVideoSelectorComponentTV, PlayerVideoSelectorComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerVideoSelectorContainer;
